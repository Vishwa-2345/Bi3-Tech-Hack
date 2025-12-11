from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv
from pathlib import Path
import shutil
from typing import Dict
import asyncio
from video_processor import VideoProcessor

load_dotenv()

app = FastAPI(title="ClearPath AI Signals - CV Service")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global video processor
video_processor = None

@app.on_event("startup")
async def startup_event():
    global video_processor
    video_processor = VideoProcessor()
    print("🚀 CV Service started")
    print("📦 Loading YOLOv8 model...")

@app.get("/")
def read_root():
    return {
        "service": "ClearPath AI Signals - CV Service",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "model_loaded": video_processor is not None}

@app.post("/api/process-videos")
async def process_videos(
    north: UploadFile = File(...),
    south: UploadFile = File(...),
    east: UploadFile = File(...),
    west: UploadFile = File(...),
    session_id: str = Form(...)
):
    """
    Receive 4 videos and process them with YOLO detection
    """
    try:
        print(f"📹 Processing videos for session: {session_id}")
        
        # Create uploads directory
        upload_dir = Path("uploads") / session_id
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Save uploaded videos
        video_paths = {}
        for direction, file in [
            ("north", north),
            ("south", south),
            ("east", east),
            ("west", west)
        ]:
            file_path = upload_dir / f"{direction}.mp4"
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            video_paths[direction] = str(file_path)
            print(f"✅ Saved {direction} video: {file_path}")
        
        # Start processing in background
        asyncio.create_task(
            video_processor.process_videos(session_id, video_paths)
        )
        
        return {
            "success": True,
            "message": "Videos received and processing started",
            "session_id": session_id
        }
        
    except Exception as e:
        print(f"❌ Error processing videos: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
