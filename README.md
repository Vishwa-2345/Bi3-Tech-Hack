# ClearPath AI Signals

## Real-Time Adaptive Traffic Signal Simulation System

A complete full-stack application that uses YOLOv8 computer vision to analyze traffic from 4 directional videos and intelligently control traffic signals based on real-time vehicle and pedestrian detection.

![ClearPath AI Signals](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🌟 Features

### 🚦 **Intelligent Signal Control**
- **Ambulance Priority**: Immediate green signal when ambulance detected
- **Pedestrian Priority**: 15-second crossing time when pedestrians detected
- **Least Traffic Priority**: Green signal for direction with minimum vehicles
- **Heavy Traffic Rotation**: Automatic rotation mode when all directions exceed 20 vehicles

### 🎥 **Advanced Computer Vision**
- YOLOv8 real-time object detection
- Detects: Car, Bike, Bus, Truck, Auto-rickshaw, Pedestrian, Ambulance
- ROI (Region of Interest) filtering - only counts vehicles within ~100m zone
- Live bounding boxes and class labels on video feeds

### 💻 **World-Class UI/UX**
- Tesla-inspired dark glass morphism design
- 4-video grid with real-time YOLO annotations
- Animated traffic signal panel with neon glow effects
- Live vehicle count dashboard
- Real-time alerts system
- Framer Motion animations

### ⚡ **Real-Time Architecture**
- WebSocket communication for instant updates
- Concurrent video processing
- Frame-by-frame analysis
- Auto-start simulation after upload

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │  React + Tailwind + Framer Motion
│   (Port 3000)   │  WebSocket Client
└────────┬────────┘
         │
         │ HTTP/WebSocket
         ▼
┌─────────────────┐
│   Backend       │  Node.js + Express + MongoDB
│   (Port 5000)   │  WebSocket Server
└────────┬────────┘
         │
         │ HTTP REST
         ▼
┌─────────────────┐
│  CV Service     │  FastAPI + YOLOv8 + OpenCV
│   (Port 8000)   │  Video Processing
└─────────────────┘
```

---

## 📦 Tech Stack

### **Frontend**
- React 18
- Tailwind CSS
- Framer Motion
- Socket.io-client
- Axios
- Lucide Icons

### **Backend**
- Node.js
- Express.js
- MongoDB (Mongoose)
- Socket.io
- Multer (file upload)

### **CV Service**
- Python 3.9+
- FastAPI
- YOLOv8 (Ultralytics)
- OpenCV
- NumPy
- PyTorch

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+ and npm
- **Python** 3.9+
- **MongoDB** (local or cloud)
- **Git**

---

## 📥 Installation

### 1️⃣ **Clone Repository**

```bash
cd "C:\Users\ASUS\Desktop\ClearPath AI Signals"
```

### 2️⃣ **Setup Frontend**

```bash
cd frontend
npm install
```

Create `.env` file:
```env
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000
```

### 3️⃣ **Setup Backend**

```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/clearpath-ai-signals
CV_SERVICE_URL=http://localhost:8000
NODE_ENV=development
```

### 4️⃣ **Setup CV Service**

```bash
cd cv-service
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

Create `.env` file:
```env
BACKEND_URL=http://localhost:5000
PORT=8000
MODEL_PATH=yolov8n.pt
CONFIDENCE_THRESHOLD=0.5
IOU_THRESHOLD=0.45
```

The YOLOv8 model will be downloaded automatically on first run.

---

## ▶️ Running Locally

### **Start all services** (use 3 separate terminals):

**Terminal 1 - MongoDB:**
```bash
mongod
```

**Terminal 2 - Backend:**
```bash
cd backend
npm start
```

**Terminal 3 - CV Service:**
```bash
cd cv-service
venv\Scripts\activate  # Windows
python main.py
```

**Terminal 4 - Frontend:**
```bash
cd frontend
npm start
```

### **Access Application:**
Open browser: `http://localhost:3000`

---

## 📖 Usage Guide

1. **Upload Videos**: Select 4 videos (north.mp4, south.mp4, east.mp4, west.mp4)
2. **Auto-Start**: Simulation starts automatically after upload
3. **Monitor Dashboard**:
   - View 4-video grid with live YOLO detections
   - Track vehicle counts per direction
   - Monitor traffic signal states
   - View system alerts

---

## 🎯 Traffic Signal Logic

### **Priority Order:**

1. **🚑 Ambulance Priority**
   - Immediate GREEN
   - Holds until ambulance exits ROI
   - Alert: "🚑 Ambulance Priority Enabled"

2. **🚶 Pedestrian Priority**
   - 15 seconds crossing time
   - Triggered when 3+ pedestrians detected
   - Alert: "🚶 Pedestrian Crossing Active (15s)"

3. **⚠️ Heavy Traffic Rotation**
   - Activated when all directions > 20 vehicles OR total > 80
   - Sequence: North → East → South → West
   - 15 seconds each
   - Alert: "⚠ Heavy Traffic — Rotation Mode ON"

4. **✅ Least Traffic Priority** (Default)
   - Direction with MINIMUM vehicle count gets GREEN
   - 15 seconds fixed duration
   - Optimizes overall traffic flow

---

## 🎨 UI Components

### **Dashboard Layout:**
- **Video Grid** (2x2): Live feeds with YOLO overlays
- **Signal Panel**: Real-time traffic light states with timers
- **Count Panel**: Vehicle counts with progress bars
- **Alerts Panel**: System notifications and priorities

### **Design Features:**
- Dark glass morphism
- Neon glow effects (green/red/yellow)
- Smooth Framer Motion animations
- Responsive layout
- Real-time data updates

---

## 🌐 Deployment

### **Frontend (Netlify/Vercel)**

**Netlify:**
```bash
cd frontend
npm run build

# Deploy build folder to Netlify
```

Environment Variables:
- `REACT_APP_BACKEND_URL`: Your backend URL
- `REACT_APP_WS_URL`: Your WebSocket URL

**Vercel:**
```bash
cd frontend
npm run build
vercel --prod
```

### **Backend (Render/Railway)**

**Render:**
1. Create new Web Service
2. Connect repository
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add environment variables

**Railway:**
```bash
cd backend
railway login
railway init
railway up
```

### **CV Service (Render/Railway)**

**Render:**
1. Create new Web Service
2. Build Command: `pip install -r requirements.txt`
3. Start Command: `python main.py`
4. Add environment variables

**Railway:**
```bash
cd cv-service
railway init
railway up
```

### **MongoDB (MongoDB Atlas)**
1. Create free cluster at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Get connection string
3. Update `MONGODB_URI` in backend `.env`

---

## 📂 Project Structure

```
ClearPath AI Signals/
│
├── frontend/                   # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/        # UI Components
│   │   │   ├── UploadSection.js
│   │   │   ├── Dashboard.js
│   │   │   ├── VideoGrid.js
│   │   │   ├── TrafficSignalPanel.js
│   │   │   ├── VehicleCountPanel.js
│   │   │   └── AlertsPanel.js
│   │   ├── services/          # API & WebSocket
│   │   │   ├── api.js
│   │   │   └── websocket.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env.example
│
├── backend/                    # Node.js Backend
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── Simulation.js
│   │   └── Alert.js
│   ├── routes/
│   │   ├── upload.js
│   │   └── simulation.js
│   ├── uploads/               # Video storage
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── cv-service/                # Python CV Service
    ├── main.py                # FastAPI app
    ├── video_processor.py     # YOLO processing
    ├── signal_logic.py        # Signal decision logic
    ├── requirements.txt
    └── .env.example
```

---

## 🔧 API Endpoints

### **Backend API**

#### Upload Videos
```http
POST /api/upload-videos
Content-Type: multipart/form-data

Fields: north, south, east, west (video files)
```

#### Get Simulation Status
```http
GET /api/simulation/status
```

#### Update Simulation (CV Service → Backend)
```http
POST /api/simulation/update
Content-Type: application/json

{
  "session_id": "string",
  "counts": { "north": 10, "south": 5, "east": 8, "west": 3 },
  "signal_state": { "north": "red", "activeDirection": "west", "timer": 12 },
  "frames": { "north": "base64..." }
}
```

#### Create Alert
```http
POST /api/simulation/alert
Content-Type: application/json

{
  "session_id": "string",
  "alert_type": "ambulance",
  "message": "Ambulance detected in North",
  "direction": "north"
}
```

### **CV Service API**

#### Process Videos
```http
POST /api/process-videos
Content-Type: multipart/form-data

Fields: north, south, east, west (videos), session_id
```

### **WebSocket Events**

#### Client → Server
- `connect`: Initial connection
- `disconnect`: Client disconnect

#### Server → Client
- `simulation_update`: Real-time state update
- `alert`: System alert notification

---

## 🐛 Troubleshooting

### **Frontend not connecting to backend:**
- Check `.env` file has correct `REACT_APP_BACKEND_URL`
- Ensure backend is running on correct port
- Check CORS settings in backend

### **WebSocket connection failed:**
- Verify `REACT_APP_WS_URL` in frontend `.env`
- Check firewall settings
- Ensure Socket.io versions match

### **YOLOv8 model not loading:**
- Run `pip install ultralytics` again
- Model downloads automatically on first run
- Check internet connection for initial download

### **MongoDB connection error:**
- Ensure MongoDB is running (`mongod`)
- Check `MONGODB_URI` in backend `.env`
- Verify MongoDB port (default 27017)

### **Video upload fails:**
- Check file size limits (500MB max)
- Verify video format (mp4, avi, mov)
- Ensure uploads folder exists with write permissions

---

## 🎓 How It Works

1. **User uploads 4 videos** → Stored in backend uploads folder
2. **Backend sends videos to CV service** → FastAPI receives videos
3. **CV service processes each frame**:
   - YOLOv8 detects objects
   - ROI polygon filters detections
   - Counts vehicles & pedestrians per direction
4. **Signal logic decides green direction**:
   - Evaluates priority rules
   - Updates timer
5. **Updates sent to backend via REST API**
6. **Backend broadcasts via WebSocket**
7. **Frontend dashboard updates in real-time**

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 👨‍💻 Author

Built with ❤️ using cutting-edge AI and full-stack technologies

---

## 🙏 Acknowledgments

- **YOLOv8** by Ultralytics
- **FastAPI** for high-performance Python API
- **React** and **Tailwind CSS** for beautiful UI
- **Framer Motion** for smooth animations
- **Socket.io** for real-time communication

---

## 📞 Support

For issues or questions:
- Open GitHub issue
- Check troubleshooting section
- Review logs in each service

---

## 🎉 Features Demo

### Upload Interface
- Clean, intuitive 4-direction upload
- Drag & drop support
- File validation
- Auto-start after upload

### Live Dashboard
- Real-time 4-video grid
- YOLO bounding boxes
- ROI visualization
- Traffic signal states
- Vehicle count panels
- Alert notifications

### Smart Signal Logic
- Ambulance emergency override
- Pedestrian safety priority
- Traffic optimization
- Heavy traffic management

---

## 📊 System Requirements

### Minimum:
- **CPU**: 4 cores
- **RAM**: 8GB
- **GPU**: Not required (CPU inference works)
- **Storage**: 5GB free space
- **Network**: 10 Mbps

### Recommended:
- **CPU**: 8 cores
- **RAM**: 16GB
- **GPU**: NVIDIA GPU with CUDA (for faster processing)
- **Storage**: 20GB free space
- **Network**: 50 Mbps

---

## 🔮 Future Enhancements

- [ ] GPU acceleration support
- [ ] Multi-session support
- [ ] Historical analytics dashboard
- [ ] Advanced ambulance detection
- [ ] Traffic density heatmaps
- [ ] Export simulation reports
- [ ] Mobile app support
- [ ] Real camera integration
- [ ] AI training interface
- [ ] Multi-language support

---

**🚀 Ready to revolutionize traffic management with AI!**
