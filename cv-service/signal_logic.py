import time
from typing import Dict
from collections import deque

class SignalLogic:
    """
    Implements adaptive traffic signal logic with priorities:
    PRIORITY 1: Ambulance Emergency (immediate override)
    PRIORITY 2: Pedestrian Crossing (>3 pedestrians)
    PRIORITY 3: Heavy Traffic Rotation (>20 each OR >80 total)
    PRIORITY 4: Default Fixed Rotation (North → East → South → West)
    NEW FEATURE: Early close rule (3 sec empty ROI)
    """
    
    def __init__(self):
        # Timing configuration
        self.green_duration = 35  # 35 seconds default
        self.yellow_duration = 3  # 3 seconds yellow
        self.pedestrian_crossing_time = 15  # 15 seconds for pedestrians
        self.heavy_traffic_threshold = 20  # Vehicles per direction
        self.total_heavy_traffic_threshold = 80  # Total vehicles
        self.ambulance_clear_duration = 5  # Keep green 5 sec after ambulance leaves
        self.empty_roi_threshold = 3  # Early close if empty for 3 seconds
        
        # Fixed rotation sequence
        self.rotation_sequence = ["north", "east", "south", "west"]
        self.rotation_index = 0
        
        # State tracking
        self.current_green_direction = None
        self.previous_green_direction = None
        self.timer = 0
        self.last_update = time.time()
        self.in_yellow_phase = False
        self.next_green_direction = None
        
        # Mode tracking
        self.current_mode = "normal"
        self.ambulance_mode = False
        self.ambulance_direction = None
        self.ambulance_clearing = False
        self.ambulance_clear_timer = 0
        
        # Early close tracking (empty ROI feature)
        self.empty_roi_timer = 0
        self.last_vehicle_count = {}
    
    def update(self, vehicle_counts: Dict[str, int], pedestrian_counts: Dict[str, int], ambulance_direction: str = None) -> Dict:
        """
        Main logic update function
        Returns current signal state
        """
        current_time = time.time()
        elapsed = current_time - self.last_update
        
        # ============================================================
        # PRIORITY 1: AMBULANCE EMERGENCY - Immediate Override
        # ============================================================
        if ambulance_direction:
            # ALWAYS reset to ambulance mode when ambulance detected
            # This ensures immediate response even if ambulance comes back
            if not self.ambulance_mode or ambulance_direction != self.ambulance_direction or self.ambulance_clearing:
                # New ambulance detection OR ambulance changed direction OR was clearing - immediate green
                print(f"🚨 AMBULANCE EMERGENCY in {ambulance_direction.upper()}! Switching signal to GREEN")
                self.current_green_direction = ambulance_direction
                self.timer = 999  # Keep green indefinitely
                self.in_yellow_phase = False
                self.current_mode = "ambulance"
                self.ambulance_mode = True
                self.ambulance_direction = ambulance_direction
                self.ambulance_clearing = False
                self.ambulance_clear_timer = 0
                self.last_update = current_time
            
            # Always reset clearing state when ambulance present
            self.ambulance_clearing = False
            self.ambulance_clear_timer = 0
            
            # All directions RED except ambulance direction (GREEN)
            signal_state = {}
            for direction in ["north", "south", "east", "west"]:
                signal_state[direction] = "green" if direction == ambulance_direction else "red"
            
            signal_state["activeDirection"] = ambulance_direction
            signal_state["timer"] = self.timer
            signal_state["mode"] = "ambulance"
            signal_state["yellowPhase"] = False
            
            return signal_state
        
        # Ambulance clearing period (5 seconds after ambulance leaves)
        if self.ambulance_mode and not ambulance_direction:
            if not self.ambulance_clearing:
                print(f"🚑 Ambulance no longer detected in {self.ambulance_direction.upper()}. Allowing clearance time...")
                self.ambulance_clearing = True
                self.ambulance_clear_timer = self.ambulance_clear_duration
            
            if self.ambulance_clear_timer > 0:
                self.ambulance_clear_timer = max(0, self.ambulance_clear_timer - int(elapsed))
                
                # Keep signal green during clearing
                signal_state = {}
                for direction in ["north", "south", "east", "west"]:
                    signal_state[direction] = "green" if direction == self.ambulance_direction else "red"
                
                signal_state["activeDirection"] = self.ambulance_direction
                signal_state["timer"] = self.ambulance_clear_timer
                signal_state["mode"] = "ambulance"
                signal_state["yellowPhase"] = False
                
                self.last_update = current_time
                return signal_state
            else:
                # Clearing complete - resume normal rotation
                print(f"✅ Ambulance fully cleared from {self.ambulance_direction.upper()}. Resuming normal traffic flow.")
                self.ambulance_mode = False
                self.ambulance_direction = None
                self.ambulance_clearing = False
                self.timer = 0  # Force immediate decision
        
        # ============================================================
        # Early Close Rule: Check if current green direction is empty
        # ============================================================
        if self.current_green_direction and not self.in_yellow_phase:
            current_count = vehicle_counts.get(self.current_green_direction, 0)
            
            # Check if ROI is empty
            if current_count == 0:
                self.empty_roi_timer += elapsed
                
                # If empty for 3 seconds, close early
                if self.empty_roi_timer >= self.empty_roi_threshold:
                    print(f"⚡ EARLY CLOSE: {self.current_green_direction.upper()} ROI empty for 3 sec → switching to next")
                    self.timer = 0  # Force immediate switch
                    self.empty_roi_timer = 0
            else:
                # Reset empty timer if vehicles detected
                self.empty_roi_timer = 0
        
        # ============================================================
        # Timer Management
        # ============================================================
        if self.timer > 0:
            self.timer = max(0, self.timer - int(elapsed))
        
        self.last_update = current_time
        
        # Timer expired - make decision
        if self.timer <= 0:
            if self.in_yellow_phase:
                # Yellow phase ended - switch to green
                self.current_green_direction = self.next_green_direction
                self.timer = self.green_duration
                self.in_yellow_phase = False
                self.empty_roi_timer = 0
                print(f"🟢 {self.current_green_direction.upper()} → GREEN")
            else:
                # Green phase ended - decide next signal
                self.decide_next_signal(vehicle_counts, pedestrian_counts)
        
        # ============================================================
        # Build Signal State
        # ============================================================
        signal_state = {}
        for direction in ["north", "south", "east", "west"]:
            if direction == self.current_green_direction and not self.in_yellow_phase:
                signal_state[direction] = "green"
            elif direction == self.current_green_direction and self.in_yellow_phase:
                signal_state[direction] = "yellow"
            else:
                signal_state[direction] = "red"
        
        signal_state["activeDirection"] = self.current_green_direction
        signal_state["timer"] = self.timer
        signal_state["mode"] = self.current_mode
        signal_state["yellowPhase"] = self.in_yellow_phase
        
        return signal_state
    
    def decide_next_signal(self, vehicle_counts: Dict[str, int], pedestrian_counts: Dict[str, int]):
        """
        Decide next signal based on priority system
        (Ambulance already handled in update())
        """
        next_direction = None
        duration = self.green_duration
        
        # ============================================================
        # PRIORITY 2: PEDESTRIAN CROSSING
        # ============================================================
        if max(pedestrian_counts.values()) > 3:
            ped_direction = max(pedestrian_counts, key=pedestrian_counts.get)
            next_direction = ped_direction
            duration = self.pedestrian_crossing_time
            self.current_mode = "pedestrian"
            print(f"🚶 PEDESTRIAN PRIORITY: {ped_direction.upper()} ({pedestrian_counts[ped_direction]} pedestrians) → YELLOW")
        
        # ============================================================
        # PRIORITY 3: HEAVY TRAFFIC ROTATION MODE
        # ============================================================
        elif (all(count > self.heavy_traffic_threshold for count in vehicle_counts.values()) or 
              sum(vehicle_counts.values()) > self.total_heavy_traffic_threshold):
            # Heavy traffic detected - use rotation sequence
            next_direction = self.rotation_sequence[self.rotation_index]
            self.rotation_index = (self.rotation_index + 1) % len(self.rotation_sequence)
            duration = self.green_duration  # 35 seconds
            self.current_mode = "heavy_traffic"
            print(f"⚠️ HEAVY TRAFFIC MODE: Rotating to {next_direction.upper()} → YELLOW")
        
        # ============================================================
        # PRIORITY 4: DEFAULT FIXED ROTATION (NEW)
        # No "least traffic" logic - just fixed rotation cycle
        # ============================================================
        else:
            # Normal traffic - use fixed rotation sequence
            next_direction = self.rotation_sequence[self.rotation_index]
            self.rotation_index = (self.rotation_index + 1) % len(self.rotation_sequence)
            duration = self.green_duration  # 35 seconds
            self.current_mode = "normal"
            print(f"🔄 DEFAULT ROTATION: {next_direction.upper()} ({vehicle_counts[next_direction]} vehicles) → YELLOW")
        
        # ============================================================
        # Transition to Yellow Phase
        # ============================================================
        self.previous_green_direction = self.current_green_direction
        self.next_green_direction = next_direction
        self.in_yellow_phase = True
        self.timer = self.yellow_duration
        
        # Store duration for when yellow ends
        self._next_green_duration = duration
        
        if self.current_green_direction:
            print(f"🟡 {self.current_green_direction.upper()} → YELLOW (transition)")
        else:
            # First signal initialization
            print(f"🟡 Starting with {next_direction.upper()} → YELLOW (transition)")
    
    def reset(self):
        """Reset signal logic state"""
        self.current_green_direction = None
        self.timer = 0
        self.ambulance_mode = False
        self.current_mode = "normal"
        self.rotation_index = 0
        self.empty_roi_timer = 0
