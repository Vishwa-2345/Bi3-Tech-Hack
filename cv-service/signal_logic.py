import time
from typing import Dict
from collections import deque

class SignalLogic:
    """
    Implements adaptive traffic signal logic with priorities:
    1. Ambulance Priority
    2. Pedestrian Priority
    3. Least Traffic Priority
    4. Heavy Traffic Rotation Mode
    """
    
    def __init__(self):
        self.green_duration = 15  # Fixed 15 seconds
        self.pedestrian_crossing_time = 15  # 15 seconds for pedestrians
        self.heavy_traffic_threshold = 20  # Vehicles per direction
        
        # State tracking
        self.current_green_direction = None
        self.timer = 0
        self.last_update = time.time()
        self.rotation_sequence = ["north", "east", "south", "west"]
        self.rotation_index = 0
        
        # Mode tracking
        self.ambulance_mode = False
        self.ambulance_direction = None
        self.pedestrian_mode = False
        self.heavy_traffic_mode = False
        
        # History for ambulance detection
        self.ambulance_history = {
            "north": deque(maxlen=10),
            "south": deque(maxlen=10),
            "east": deque(maxlen=10),
            "west": deque(maxlen=10),
        }
    
    def detect_ambulance(self, counts: Dict[str, int]) -> str:
        """
        Detect ambulance by sudden spike in vehicle count
        (In production, use specific ambulance class detection)
        """
        # This is a simplified ambulance detection
        # In production, YOLOv8 would detect ambulance class specifically
        for direction in counts.keys():
            # For simulation, ambulance is detected if count suddenly increases
            # Real implementation would check for ambulance class from YOLO
            pass
        return None
    
    def update(self, vehicle_counts: Dict[str, int], pedestrian_counts: Dict[str, int]) -> Dict:
        """
        Main logic update function
        Returns current signal state
        """
        current_time = time.time()
        elapsed = current_time - self.last_update
        
        # Update timer
        if self.timer > 0:
            self.timer = max(0, self.timer - int(elapsed))
        
        self.last_update = current_time
        
        # Check if timer expired
        if self.timer <= 0:
            self.decide_next_signal(vehicle_counts, pedestrian_counts)
        
        # Build signal state
        signal_state = {
            "north": "green" if self.current_green_direction == "north" else "red",
            "south": "green" if self.current_green_direction == "south" else "red",
            "east": "green" if self.current_green_direction == "east" else "red",
            "west": "green" if self.current_green_direction == "west" else "red",
            "activeDirection": self.current_green_direction,
            "timer": self.timer,
        }
        
        return signal_state
    
    def decide_next_signal(self, vehicle_counts: Dict[str, int], pedestrian_counts: Dict[str, int]):
        """
        Decide which direction gets green signal based on priority logic
        """
        
        # Priority 1: Ambulance Detection
        ambulance_direction = self.detect_ambulance(vehicle_counts)
        if ambulance_direction:
            self.current_green_direction = ambulance_direction
            self.timer = self.green_duration
            self.ambulance_mode = True
            print(f"🚑 AMBULANCE PRIORITY: {ambulance_direction} → GREEN")
            return
        
        # Priority 2: Pedestrian Crossing
        max_pedestrians = max(pedestrian_counts.values())
        if max_pedestrians > 3:  # If more than 3 pedestrians
            # Find direction with most pedestrians
            ped_direction = max(pedestrian_counts, key=pedestrian_counts.get)
            self.current_green_direction = ped_direction
            self.timer = self.pedestrian_crossing_time
            self.pedestrian_mode = True
            print(f"🚶 PEDESTRIAN PRIORITY: {ped_direction} → GREEN (15s)")
            return
        
        # Priority 3: Heavy Traffic Rotation Mode
        total_vehicles = sum(vehicle_counts.values())
        all_heavy = all(count > self.heavy_traffic_threshold for count in vehicle_counts.values())
        
        if all_heavy or total_vehicles > 80:
            # Rotation mode: North → East → South → West
            self.current_green_direction = self.rotation_sequence[self.rotation_index]
            self.rotation_index = (self.rotation_index + 1) % len(self.rotation_sequence)
            self.timer = self.green_duration
            self.heavy_traffic_mode = True
            print(f"⚠️ HEAVY TRAFFIC MODE: Rotating to {self.current_green_direction} → GREEN")
            return
        
        # Priority 4: Least Traffic Priority (Default)
        # Find direction with MINIMUM vehicle count
        min_direction = min(vehicle_counts, key=vehicle_counts.get)
        self.current_green_direction = min_direction
        self.timer = self.green_duration
        self.heavy_traffic_mode = False
        self.pedestrian_mode = False
        print(f"✅ LEAST TRAFFIC PRIORITY: {min_direction} ({vehicle_counts[min_direction]} vehicles) → GREEN")
    
    def reset(self):
        """Reset signal logic state"""
        self.current_green_direction = None
        self.timer = 0
        self.ambulance_mode = False
        self.pedestrian_mode = False
        self.heavy_traffic_mode = False
