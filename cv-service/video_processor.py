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
        
        # Detection classes
        self.target_classes = {
            0: 'Person',  # Pedestrian
            1: 'Bicycle',
            2: 'Car',
            3: 'Motorcycle',
            5: 'Bus',
            7: 'Truck',
        }
        
        self.confidence_threshold = float(os.getenv("CONFIDENCE_THRESHOLD", 0.5))
        self.backend_url = os.getenv("BACKEND_URL", "http://localhost:5000")
        
        # Initialize signal logic
        self.signal_logic = SignalLogic()
        
        print("✅ YOLO model loaded successfully")
    
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
    
    def detect_and_count(self, frame: np.ndarray, direction: str) -> Tuple[int, int, np.ndarray]:
        """
        Detect objects in frame and count those inside ROI
        Returns: (vehicle_count, pedestrian_count, annotated_frame)
        """
        height, width = frame.shape[:2]
        roi = self.get_roi_polygon(width, height, direction)
        
        # Draw ROI on frame
        cv2.polylines(frame, [roi], True, (255, 0, 255), 2)
        cv2.putText(frame, "ROI", 
                   tuple(roi[0]), 
                   cv2.FONT_HERSHEY_SIMPLEX, 
                   0.7, (255, 0, 255), 2)
        
        # Run YOLO detection
        results = self.model(frame, conf=self.confidence_threshold, verbose=False)
        
        vehicle_count = 0
        pedestrian_count = 0
        ambulance_detected = False
        
        for result in results:
            boxes = result.boxes
            for box in boxes:
                # Get class and confidence
                cls = int(box.cls[0])
                conf = float(box.conf[0])
                
                # Only process target classes
                if cls not in self.target_classes:
                    continue
                
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
        
        return vehicle_count, pedestrian_count, frame
    
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
            
            while True:
                frames = {}
                counts = {"north": 0, "south": 0, "east": 0, "west": 0}
                pedestrian_counts = {"north": 0, "south": 0, "east": 0, "west": 0}
                
                # Process all directions
                all_finished = True
                for direction, cap in captures.items():
                    ret, frame = cap.read()
                    
                    if not ret:
                        # Video ended, restart from beginning
                        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                        ret, frame = cap.read()
                        if not ret:
                            continue
                    
                    all_finished = False
                    
                    # Detect and count
                    vehicle_count, pedestrian_count, annotated_frame = self.detect_and_count(
                        frame.copy(), direction
                    )
                    
                    counts[direction] = vehicle_count
                    pedestrian_counts[direction] = pedestrian_count
                    
                    # Convert frame to base64
                    frames[direction] = self.frame_to_base64(annotated_frame)
                
                if all_finished:
                    print("✅ All videos processed")
                    break
                
                # Get signal state from logic
                signal_state = self.signal_logic.update(counts, pedestrian_counts)
                
                # Send update to backend every 5 frames
                if frame_count % 5 == 0:
                    await self.send_update(session_id, counts, signal_state, frames)
                
                frame_count += 1
                
                # Small delay to simulate real-time
                await asyncio.sleep(0.1)
            
            # Clean up
            for cap in captures.values():
                cap.release()
            
            print(f"✅ Session {session_id} completed")
            
        except Exception as e:
            print(f"❌ Error processing videos: {str(e)}")
            import traceback
            traceback.print_exc()
    
    async def send_update(self, session_id: str, counts: Dict, signal_state: Dict, frames: Dict):
        """Send update to backend"""
        try:
            response = requests.post(
                f"{self.backend_url}/api/simulation/update",
                json={
                    "session_id": session_id,
                    "counts": counts,
                    "signal_state": signal_state,
                    "frames": frames,
                },
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
