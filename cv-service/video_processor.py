import cv2
import numpy as np
import os
from typing import Dict, List, Tuple
import base64
from signal_logic import SignalLogic
import torch

# Patch torch.load to allow YOLOv8 weights loading in PyTorch 2.6+
_original_torch_load = torch.load
def _patched_torch_load(f, map_location=None, pickle_module=None, *, weights_only=None, **kwargs):
    # Set weights_only=False for YOLOv8 model files (trusted source)
    if weights_only is None:
        weights_only = False
    return _original_torch_load(f, map_location=map_location, pickle_module=pickle_module, weights_only=weights_only, **kwargs)
torch.load = _patched_torch_load

from ultralytics import YOLO
import asyncio
import requests

class VideoProcessor:
    def __init__(self):
        # Load YOLOv8 model
        model_path = os.getenv("MODEL_PATH", "yolov8n.pt")
        self.model = YOLO(model_path)
        
        # Detection classes with detailed vehicle types
        self.target_classes = {
            0: 'Person',  # Pedestrian
            1: 'Bicycle',
            2: 'Car',
            3: 'Motorcycle',
            5: 'Bus',
            7: 'Truck',
        }
        
        # Vehicle type categories
        self.vehicle_types = {
            'Car': [2],
            'Bus': [5],
            'Truck': [7],
            'Bike': [1, 3],  # Bicycle and Motorcycle
        }
        
        self.confidence_threshold = float(os.getenv("CONFIDENCE_THRESHOLD", 0.4))  # Lowered for speed
        self.backend_url = os.getenv("BACKEND_URL", "http://localhost:5000")
        
        # Initialize signal logic
        self.signal_logic = SignalLogic()
        
        # Simulation mode for testing ambulance detection
        self.simulate_ambulance_every_n_frames = int(os.getenv("AMBULANCE_SIMULATION_FRAMES", 300))  # Every 300 frames (10 sec)
        self.ambulance_simulation_enabled = os.getenv("SIMULATE_AMBULANCE", "false").lower() == "true"
        
        print("✅ YOLO model loaded successfully")
        if self.ambulance_simulation_enabled:
            print(f"🚑 Ambulance simulation mode ENABLED (every {self.simulate_ambulance_every_n_frames} frames)")
    
    def get_roi_polygon(self, frame_width: int, frame_height: int, direction: str) -> np.ndarray:
        """
        Define ROI polygon for each direction in a 4-way intersection video
        Divides the frame into 4 quadrants: north (bottom), south (top), east (left), west (right)
        Returns polygon coordinates
        """
        mid_x = frame_width // 2
        mid_y = frame_height // 2
        margin = 50  # Margin from center for clearer separation
        
        if direction == "north":
            # Bottom half of frame (vehicles approaching from bottom)
            roi = np.array([
                [int(frame_width * 0.15), mid_y + margin],
                [int(frame_width * 0.85), mid_y + margin],
                [int(frame_width * 0.85), int(frame_height * 0.95)],
                [int(frame_width * 0.15), int(frame_height * 0.95)],
            ], np.int32)
        elif direction == "south":
            # Top half of frame (vehicles approaching from top)
            roi = np.array([
                [int(frame_width * 0.15), int(frame_height * 0.05)],
                [int(frame_width * 0.85), int(frame_height * 0.05)],
                [int(frame_width * 0.85), mid_y - margin],
                [int(frame_width * 0.15), mid_y - margin],
            ], np.int32)
        elif direction == "east":
            # Left half of frame (vehicles approaching from left)
            roi = np.array([
                [int(frame_width * 0.05), int(frame_height * 0.15)],
                [mid_x - margin, int(frame_height * 0.15)],
                [mid_x - margin, int(frame_height * 0.85)],
                [int(frame_width * 0.05), int(frame_height * 0.85)],
            ], np.int32)
        else:  # west
            # Right half of frame (vehicles approaching from right)
            roi = np.array([
                [mid_x + margin, int(frame_height * 0.15)],
                [int(frame_width * 0.95), int(frame_height * 0.15)],
                [int(frame_width * 0.95), int(frame_height * 0.85)],
                [mid_x + margin, int(frame_height * 0.85)],
            ], np.int32)
        
        return roi
    
    def is_point_in_roi(self, point: Tuple[int, int], roi: np.ndarray) -> bool:
        """Check if point is inside ROI polygon"""
        return cv2.pointPolygonTest(roi, point, False) >= 0
    
    def detect_ambulance_lights(self, frame: np.ndarray) -> bool:
        """
        Detect red/blue flashing lights indicating ambulance
        Returns True if ambulance lights detected
        """
        # Convert to HSV for better color detection
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        
        # Red color range for emergency lights (high saturation and value)
        lower_red1 = np.array([0, 120, 120])  # High saturation/value for bright lights
        upper_red1 = np.array([10, 255, 255])
        lower_red2 = np.array([170, 120, 120])
        upper_red2 = np.array([180, 255, 255])
        
        # Blue color range for emergency lights (high saturation and value)
        lower_blue = np.array([100, 120, 120])  # High saturation/value for bright lights
        upper_blue = np.array([130, 255, 255])
        
        # Create masks
        mask_red1 = cv2.inRange(hsv, lower_red1, upper_red1)
        mask_red2 = cv2.inRange(hsv, lower_red2, upper_red2)
        mask_red = cv2.bitwise_or(mask_red1, mask_red2)
        mask_blue = cv2.inRange(hsv, lower_blue, upper_blue)
        
        # Count red and blue pixels
        red_pixels = cv2.countNonZero(mask_red)
        blue_pixels = cv2.countNonZero(mask_blue)
        
        # Higher threshold to reduce false positives: 2% of frame
        total_pixels = frame.shape[0] * frame.shape[1]
        red_ratio = red_pixels / total_pixels
        blue_ratio = blue_pixels / total_pixels
        
        # Only detect if significant bright red or blue lights present
        if red_ratio > 0.02 or blue_ratio > 0.02:
            return True
        
        return False
    
    def detect_and_count(self, frame: np.ndarray, direction: str) -> Tuple[int, int, np.ndarray, Dict[str, int], bool]:
        """
        Detect objects in frame and count those inside ROI
        Returns: (vehicle_count, pedestrian_count, annotated_frame, vehicle_breakdown, ambulance_detected)
        """
        height, width = frame.shape[:2]
        roi = self.get_roi_polygon(width, height, direction)
        
        # Check for ambulance lights first
        ambulance_detected = self.detect_ambulance_lights(frame)
        
        # Also check if any bright red/white vehicles detected (potential ambulance)
        # Look for vehicles with predominantly red color
        ambulance_confidence = 0
        for result in self.model(frame, conf=self.confidence_threshold, verbose=False):
            for box in result.boxes:
                cls = int(box.cls[0])
                if cls in [2, 5, 7]:  # Car, Bus, Truck
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    vehicle_crop = frame[int(y1):int(y2), int(x1):int(x2)]
                    if vehicle_crop.size > 0:
                        # Check if vehicle is predominantly red
                        hsv_crop = cv2.cvtColor(vehicle_crop, cv2.COLOR_BGR2HSV)
                        lower_red = np.array([0, 100, 100])
                        upper_red = np.array([10, 255, 255])
                        mask = cv2.inRange(hsv_crop, lower_red, upper_red)
                        red_ratio = cv2.countNonZero(mask) / (vehicle_crop.shape[0] * vehicle_crop.shape[1])
                        if red_ratio > 0.25:  # 25% red - higher threshold
                            ambulance_confidence = max(ambulance_confidence, red_ratio)
                            ambulance_detected = True
        
        # Only print if high confidence detection
        if ambulance_detected and ambulance_confidence > 0:
            print(f"🚑 AMBULANCE detected (confidence: {ambulance_confidence:.1%})")
        
        # Draw ROI on frame
        cv2.polylines(frame, [roi], True, (255, 0, 255), 2)
        cv2.putText(frame, "ROI", 
                   tuple(roi[0]), 
                   cv2.FONT_HERSHEY_SIMPLEX, 
                   0.7, (255, 0, 255), 2)
        
        # If ambulance detected, show prominent warning
        if ambulance_detected:
            cv2.rectangle(frame, (10, 90), (width - 10, 150), (0, 0, 255), -1)
            cv2.putText(frame, "AMBULANCE DETECTED!", 
                       (30, 125), 
                       cv2.FONT_HERSHEY_SIMPLEX, 
                       1.2, (255, 255, 255), 3)
        
        # Run YOLO detection with optimizations
        results = self.model(frame, conf=self.confidence_threshold, verbose=False, 
                            imgsz=480, half=False)  # Smaller image size for speed
        
        vehicle_count = 0
        pedestrian_count = 0
        # DON'T reset ambulance_detected here - it was already set by detect_ambulance_lights() and red vehicle check above!
        # ambulance_detected is already initialized before YOLO loop
        
        # Vehicle type breakdown
        vehicle_breakdown = {
            'Car': 0,
            'Bus': 0,
            'Truck': 0,
            'Bike': 0
        }
        
        for result in results:
            boxes = result.boxes
            for box in boxes:
                # Get class and confidence
                cls = int(box.cls[0])
                conf = float(box.conf[0])
                
                # Only process target classes
                if cls not in self.target_classes:
                    continue
                                # FOR TESTING: Treat buses as ambulances (can be toggled via .env)
                if cls == 5 and os.getenv("TREAT_BUS_AS_AMBULANCE", "true").lower() == "true":
                    ambulance_detected = True
                    print(f"🚑 BUS DETECTED - Treating as ambulance for testing!")
                                # Get bounding box
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                center_x = int((x1 + x2) / 2)
                center_y = int((y1 + y2) / 2)
                
                # Check if center is in ROI
                if not self.is_point_in_roi((center_x, center_y), roi):
                    continue
                
                # Count vehicles inside ROI
                class_name = self.target_classes[cls]
                
                if cls == 0:  # Person
                    pedestrian_count += 1
                    color = (0, 255, 255)  # Yellow for pedestrians
                else:
                    vehicle_count += 1
                    color = (0, 255, 0)  # Green for vehicles
                    
                    # Track vehicle type
                    for v_type, class_ids in self.vehicle_types.items():
                        if cls in class_ids:
                            vehicle_breakdown[v_type] += 1
                            break
                
                # Draw bounding box
                cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), color, 2)
                
                # Draw label
                label = f"{class_name} {conf:.2f}"
                cv2.putText(frame, label, 
                          (int(x1), int(y1) - 10),
                          cv2.FONT_HERSHEY_SIMPLEX, 
                          0.5, color, 2)
        
        # Add count overlay
        cv2.putText(frame, f"Vehicles: {vehicle_count}", 
                   (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 
                   0.8, (0, 255, 0), 2)
        cv2.putText(frame, f"Pedestrians: {pedestrian_count}", 
                   (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 
                   0.8, (0, 255, 255), 2)
        
        return vehicle_count, pedestrian_count, frame, vehicle_breakdown, ambulance_detected
    
    def frame_to_base64(self, frame: np.ndarray) -> str:
        """Convert frame to base64 string"""
        _, buffer = cv2.imencode('.jpg', frame)
        return base64.b64encode(buffer).decode('utf-8')
    
    async def process_videos(self, session_id: str, video_paths: Dict[str, str]):
        """
        Main processing loop for all 4 videos
        """
        try:
            print(f"🎬 Starting video processing for session: {session_id}")
            
            # Open all video captures
            captures = {}
            for direction, path in video_paths.items():
                cap = cv2.VideoCapture(path)
                if not cap.isOpened():
                    print(f"❌ Failed to open {direction} video")
                    return
                captures[direction] = cap
                print(f"✅ Opened {direction} video")
            
            frame_count = 0
            last_frames = {}  # Store last processed frames
            last_counts = {"north": 0, "south": 0, "east": 0, "west": 0}
            last_ped_counts = {"north": 0, "south": 0, "east": 0, "west": 0}
            last_breakdown = {
                "north": {"Car": 0, "Bus": 0, "Truck": 0, "Bike": 0},
                "south": {"Car": 0, "Bus": 0, "Truck": 0, "Bike": 0},
                "east": {"Car": 0, "Bus": 0, "Truck": 0, "Bike": 0},
                "west": {"Car": 0, "Bus": 0, "Truck": 0, "Bike": 0}
            }
            ambulance_directions = set()  # Track which directions have ambulances
            last_ambulance_detected = {"north": False, "south": False, "east": False, "west": False}
            
            while True:
                frames = {}
                counts = last_counts.copy()
                pedestrian_counts = last_ped_counts.copy()
                vehicle_breakdown = last_breakdown.copy()
                
                # Process all directions
                all_finished = True
                for direction, cap in captures.items():
                    ret, frame = cap.read()
                    
                    if not ret:
                        # Video ended, restart from beginning
                        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                        ret, frame = cap.read()
                        if not ret:
                            print(f"[ERROR] Failed to read {direction} video even after restart")
                            continue
                    
                    all_finished = False
                    
                    # Run YOLO every 3rd frame to balance speed and accuracy
                    if frame_count % 3 == 0:
                        # Detect and count
                        vehicle_count, pedestrian_count, annotated_frame, breakdown, ambulance_detected = self.detect_and_count(
                            frame.copy(), direction
                        )
                        
                        # Store ambulance detection status
                        last_ambulance_detected[direction] = ambulance_detected
                        
                        # Handle ambulance detection
                        if ambulance_detected:
                            if direction not in ambulance_directions:
                                ambulance_directions.add(direction)
                                print(f"🚑 AMBULANCE DETECTED in {direction.upper()} direction!")
                                # Send ambulance alert
                                await self.send_alert(
                                    session_id,
                                    "ambulance",
                                    f"AMBULANCE DETECTED! {direction.upper()} direction - Giving immediate priority",
                                    direction
                                )
                        else:
                            # Remove from set if no longer detected
                            if direction in ambulance_directions:
                                ambulance_directions.discard(direction)
                                print(f"✅ Ambulance cleared from {direction.upper()}")
                        
                        counts[direction] = vehicle_count
                        pedestrian_counts[direction] = pedestrian_count
                        vehicle_breakdown[direction] = breakdown
                        
                        # Store for next frames
                        last_counts[direction] = vehicle_count
                        last_ped_counts[direction] = pedestrian_count
                        last_breakdown[direction] = breakdown
                        
                        # Convert frame to base64
                        frames[direction] = self.frame_to_base64(annotated_frame)
                        last_frames[direction] = frames[direction]
                    else:
                        # Reuse last frame for smooth display
                        if direction in last_frames:
                            frames[direction] = last_frames[direction]
                        
                        # Maintain ambulance detection between YOLO runs
                        if last_ambulance_detected.get(direction, False):
                            ambulance_directions.add(direction)
                
                if all_finished:
                    print("✅ All videos processed")
                    break
                
                # Get signal state from logic
                # Pass ambulance direction if detected
                ambulance_dir = list(ambulance_directions)[0] if ambulance_directions else None
                
                # Debug: Show ambulance status
                if ambulance_directions:
                    print(f"🚨 ambulance_directions set = {ambulance_directions}, ambulance_dir='{ambulance_dir}'")
                if ambulance_dir:
                    print(f"🚨 Passing ambulance_dir='{ambulance_dir}' to signal logic")
                
                signal_state = self.signal_logic.update(counts, pedestrian_counts, ambulance_dir)
                
                # Send update to backend (send more frequently for smooth updates)
                if frame_count % 2 == 0 and frames:  # Every 2 frames if we have frames
                    await self.send_update(session_id, counts, signal_state, frames, vehicle_breakdown)
                
                frame_count += 1
                
                # Small delay to prevent CPU overload but keep video fast (0.001s = 1000 FPS max)
                await asyncio.sleep(0.001)
            
            # Clean up
            for cap in captures.values():
                cap.release()
            
            # Mark simulation as complete
            await self.send_complete(session_id)
            
            print(f"✅ Session {session_id} completed")
            
        except Exception as e:
            print(f"❌ Error processing videos: {str(e)}")
            import traceback
            traceback.print_exc()
    
    async def send_update(self, session_id: str, counts: Dict, signal_state: Dict, frames: Dict, vehicle_breakdown: Dict = None):
        """Send update to backend"""
        try:
            payload = {
                "session_id": session_id,
                "counts": counts,
                "signal_state": signal_state,
                "frames": frames,
            }
            
            if vehicle_breakdown:
                payload["vehicle_breakdown"] = vehicle_breakdown
            
            response = requests.post(
                f"{self.backend_url}/api/simulation/update",
                json=payload,
                timeout=5
            )
            
            if response.status_code != 200:
                print(f"⚠️ Backend update failed: {response.status_code}")
        except Exception as e:
            print(f"⚠️ Failed to send update: {str(e)}")
    
    async def send_alert(self, session_id: str, alert_type: str, message: str, direction: str = None):
        """Send alert to backend"""
        try:
            response = requests.post(
                f"{self.backend_url}/api/simulation/alert",
                json={
                    "session_id": session_id,
                    "alert_type": alert_type,
                    "message": message,
                    "direction": direction,
                },
                timeout=5
            )
        except Exception as e:
            print(f"⚠️ Failed to send alert: {str(e)}")
    
    async def send_complete(self, session_id: str):
        """Mark simulation as complete"""
        try:
            response = requests.post(
                f"{self.backend_url}/api/simulation/complete",
                json={"session_id": session_id},
                timeout=5
            )
            if response.status_code == 200:
                print(f"✅ Simulation {session_id} marked as complete")
        except Exception as e:
            print(f"⚠️ Failed to mark simulation complete: {str(e)}")
