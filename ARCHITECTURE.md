# System Architecture Diagrams

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐   │
│  │          React Frontend (Port 3000)                 │   │
│  │                                                      │   │
│  │  - Upload Section                                   │   │
│  │  - Dashboard (4-video grid)                        │   │
│  │  - Traffic Signal Panel                            │   │
│  │  - Vehicle Count Panel                             │   │
│  │  - Alerts Panel                                    │   │
│  │                                                      │   │
│  │  Technologies: React, Tailwind, Framer Motion      │   │
│  └────────────────────────────────────────────────────┘   │
└────────────────┬──────────────────────┬────────────────────┘
                 │                       │
                 │ HTTP/REST            │ WebSocket
                 │                       │
┌────────────────▼──────────────────────▼────────────────────┐
│              Node.js Backend (Port 5000)                    │
│                                                              │
│  ┌──────────────────┐  ┌─────────────────┐                │
│  │  Express Server  │  │  Socket.io      │                │
│  │  - Upload API    │  │  - Real-time    │                │
│  │  - Simulation API│  │    updates      │                │
│  │  - REST routes   │  │  - Broadcast    │                │
│  └──────────────────┘  └─────────────────┘                │
│                                                              │
│  Technologies: Node.js, Express, Socket.io, Multer         │
└────────────────┬──────────────────────┬────────────────────┘
                 │                       │
                 │ HTTP/REST            │ MongoDB
                 │                       │
┌────────────────▼─────────┐    ┌──────▼──────────────────┐
│  Python CV Service       │    │   MongoDB Database       │
│  (Port 8000)             │    │                          │
│                          │    │  - Simulations           │
│  ┌─────────────────┐    │    │  - Alerts                │
│  │  FastAPI        │    │    │  - Session data          │
│  │  - Process API  │    │    │                          │
│  └─────────────────┘    │    └──────────────────────────┘
│                          │
│  ┌─────────────────┐    │
│  │  YOLO Detector  │    │
│  │  - YOLOv8       │    │
│  │  - OpenCV       │    │
│  │  - ROI filter   │    │
│  └─────────────────┘    │
│                          │
│  ┌─────────────────┐    │
│  │  Signal Logic   │    │
│  │  - Ambulance    │    │
│  │  - Pedestrian   │    │
│  │  - Heavy traffic│    │
│  │  - Least traffic│    │
│  └─────────────────┘    │
│                          │
│  Technologies: FastAPI,  │
│  YOLOv8, OpenCV, PyTorch│
└──────────────────────────┘
```

---

## Data Flow Diagram

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │ 1. Upload 4 videos
       ▼
┌─────────────────────────┐
│  Frontend (React)       │
│  - Validates files      │
│  - Shows upload UI      │
└──────┬──────────────────┘
       │ 2. POST /api/upload-videos
       ▼
┌─────────────────────────┐
│  Backend (Node.js)      │
│  - Saves to disk        │
│  - Creates session      │
│  - Saves to MongoDB     │
└──────┬──────────────────┘
       │ 3. Forward videos
       ▼
┌─────────────────────────┐
│  CV Service (Python)    │
│  - Opens video files    │
│  - Process each frame:  │
│    • YOLO detection     │
│    • ROI filtering      │
│    • Count vehicles     │
│    • Signal decision    │
└──────┬──────────────────┘
       │ 4. Send updates
       ▼
┌─────────────────────────┐
│  Backend (Node.js)      │
│  - Receives updates     │
│  - Saves state to DB    │
│  - Broadcasts via WS    │
└──────┬──────────────────┘
       │ 5. WebSocket push
       ▼
┌─────────────────────────┐
│  Frontend (React)       │
│  - Updates dashboard    │
│  - Renders video frames │
│  - Shows counts         │
│  - Updates signals      │
│  - Displays alerts      │
└─────────────────────────┘
       │
       │ 6. User views real-time simulation
       ▼
┌─────────────┐
│    User     │
└─────────────┘
```

---

## Component Hierarchy

```
App.js
├── UploadSection.js
│   └── UploadCard (x4)
│       ├── File input
│       ├── Validation
│       └── Upload button
│
└── Dashboard.js
    ├── Header
    │   └── Title + Description
    │
    ├── VideoGrid.js
    │   └── VideoCard (x4)
    │       ├── Direction label
    │       ├── Signal indicator
    │       ├── Video frame (base64)
    │       └── ROI overlay
    │
    ├── TrafficSignalPanel.js
    │   ├── Direction signals (x4)
    │   │   ├── Traffic light (red/green)
    │   │   ├── Direction name
    │   │   ├── Timer (if active)
    │   │   └── Status badge
    │   └── Active direction info
    │
    ├── VehicleCountPanel.js
    │   ├── Total count card
    │   └── Direction counts (x4)
    │       ├── Count number
    │       ├── Progress bar
    │       └── Status labels
    │
    └── AlertsPanel.js
        └── Alert cards
            ├── Icon
            ├── Message
            └── Timestamp
```

---

## Signal Logic Flowchart

```
┌─────────────────────┐
│  Frame Processed    │
│  - Counts updated   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Check Priority 1:  │
│  Ambulance?         │
└──────────┬──────────┘
           │
    Yes ───┼──► Give GREEN to ambulance direction
           │    Hold until exits ROI
           │    Send alert
           │
    No ────┤
           │
           ▼
┌─────────────────────┐
│  Check Priority 2:  │
│  Pedestrians > 3?   │
└──────────┬──────────┘
           │
    Yes ───┼──► Give GREEN to pedestrian direction
           │    15 seconds crossing time
           │    Send alert
           │
    No ────┤
           │
           ▼
┌─────────────────────┐
│  Check Priority 3:  │
│  Heavy Traffic?     │
│  (All dirs > 20 OR  │
│   Total > 80)       │
└──────────┬──────────┘
           │
    Yes ───┼──► Rotation Mode
           │    North → East → South → West
           │    15 seconds each
           │    Send alert
           │
    No ────┤
           │
           ▼
┌─────────────────────┐
│  Priority 4:        │
│  Least Traffic      │
│  (Default)          │
└──────────┬──────────┘
           │
           ▼
    Find direction with MINIMUM vehicles
    Give GREEN for 15 seconds
    Log decision
           │
           ▼
┌─────────────────────┐
│  Update Timer       │
│  Broadcast state    │
└─────────────────────┘
           │
           ▼
    Wait for timer to expire
    Then repeat cycle
```

---

## YOLO Detection Pipeline

```
┌──────────────┐
│  Video Frame │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  YOLOv8 Inference    │
│  - Confidence > 0.5  │
│  - Target classes:   │
│    • Car (2)         │
│    • Bike (1)        │
│    • Bus (5)         │
│    • Truck (7)       │
│    • Motorcycle (3)  │
│    • Person (0)      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Get Bounding Boxes  │
│  - x1, y1, x2, y2    │
│  - Calculate center  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  ROI Polygon Filter  │
│  - Define ROI coords │
│  - Check if center   │
│    inside polygon    │
└──────┬───────────────┘
       │
       ├──► Inside ROI ──┐
       │                 │
       └──► Outside ROI ──► Ignore
                         │
                         ▼
              ┌────────────────────┐
              │  Count & Classify  │
              │  - Vehicles++      │
              │  - Pedestrians++   │
              └─────────┬──────────┘
                        │
                        ▼
              ┌────────────────────┐
              │  Draw Annotations  │
              │  - Bounding box    │
              │  - Label + conf    │
              │  - ROI polygon     │
              │  - Count overlay   │
              └─────────┬──────────┘
                        │
                        ▼
              ┌────────────────────┐
              │  Encode to Base64  │
              │  - JPEG format     │
              └─────────┬──────────┘
                        │
                        ▼
              ┌────────────────────┐
              │  Send to Backend   │
              └────────────────────┘
```

---

## Database Schema

```
┌───────────────────────────────────────┐
│         Simulations Collection        │
├───────────────────────────────────────┤
│  _id: ObjectId                        │
│  sessionId: String (unique)           │
│  videos: {                            │
│    north: String (path)               │
│    south: String (path)               │
│    east: String (path)                │
│    west: String (path)                │
│  }                                    │
│  status: Enum (pending/processing/    │
│                completed/failed)      │
│  currentState: {                      │
│    counts: {                          │
│      north: Number                    │
│      south: Number                    │
│      east: Number                     │
│      west: Number                     │
│    }                                  │
│    signalState: {                     │
│      north: String (red/green)        │
│      south: String (red/green)        │
│      east: String (red/green)         │
│      west: String (red/green)         │
│      activeDirection: String          │
│      timer: Number                    │
│    }                                  │
│  }                                    │
│  startedAt: Date                      │
│  completedAt: Date                    │
│  createdAt: Date (auto)               │
│  updatedAt: Date (auto)               │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│           Alerts Collection           │
├───────────────────────────────────────┤
│  _id: ObjectId                        │
│  sessionId: String                    │
│  alertType: Enum (ambulance/          │
│             pedestrian/heavy_traffic/ │
│             warning/info)             │
│  message: String                      │
│  direction: String (optional)         │
│  metadata: Mixed (optional)           │
│  timestamp: Date                      │
│  createdAt: Date (auto)               │
│  updatedAt: Date (auto)               │
└───────────────────────────────────────┘
```

---

## WebSocket Communication

```
┌──────────────────┐         ┌──────────────────┐
│  Frontend Client │         │  Backend Server  │
└────────┬─────────┘         └─────────┬────────┘
         │                              │
         │ 1. Connect                   │
         ├─────────────────────────────►│
         │                              │
         │ 2. 'connect' event           │
         │◄─────────────────────────────┤
         │    {id: socket.id}           │
         │                              │
         │                              │
         │                       ┌──────▼───────┐
         │                       │ CV Service   │
         │                       │ sends update │
         │                       └──────┬───────┘
         │                              │
         │ 3. 'simulation_update'       │
         │◄─────────────────────────────┤
         │    {counts, signalState,     │
         │     frames}                  │
         │                              │
         │ 4. 'alert'                   │
         │◄─────────────────────────────┤
         │    {alertType, message,      │
         │     direction, timestamp}    │
         │                              │
         │ 5. Disconnect                │
         ├─────────────────────────────►│
         │                              │
         │ 6. 'disconnect' event        │
         │◄─────────────────────────────┤
         │                              │
```

---

## Deployment Architecture

```
┌────────────────────────────────────────────────────┐
│                  Internet/Users                     │
└─────────────────────┬──────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│   Netlify    │ │  Render  │ │    Render    │
│   (Frontend) │ │ (Backend)│ │ (CV Service) │
│              │ │          │ │              │
│ Static CDN   │ │ Node.js  │ │   Python     │
│ React Build  │ │ Express  │ │   FastAPI    │
│              │ │ Socket.io│ │   YOLOv8     │
└──────────────┘ └─────┬────┘ └──────────────┘
                       │
                       │
                       ▼
              ┌─────────────────┐
              │  MongoDB Atlas  │
              │                 │
              │  Cloud Database │
              │  (Free M0)      │
              └─────────────────┘

Legend:
• Netlify: CDN for React app
• Render Backend: Express + WebSocket server
• Render CV: Python FastAPI + YOLO processing
• MongoDB Atlas: Cloud database
```

---

## Security Architecture

```
┌─────────────────────────────────────────┐
│            Security Layers               │
├─────────────────────────────────────────┤
│                                          │
│  1. Frontend Security                   │
│     ├─ File type validation             │
│     ├─ File size validation             │
│     ├─ HTTPS only (production)          │
│     └─ Environment variables            │
│                                          │
│  2. Backend Security                    │
│     ├─ CORS configuration               │
│     ├─ File type checking               │
│     ├─ Size limits (500MB)              │
│     ├─ Input sanitization               │
│     ├─ Environment variables            │
│     └─ MongoDB connection security      │
│                                          │
│  3. CV Service Security                 │
│     ├─ Input validation                 │
│     ├─ File path restrictions           │
│     ├─ Environment variables            │
│     └─ Error handling                   │
│                                          │
│  4. Database Security                   │
│     ├─ Connection string encryption     │
│     ├─ User authentication              │
│     ├─ Network access control           │
│     └─ Data encryption at rest          │
│                                          │
│  5. Network Security                    │
│     ├─ HTTPS/WSS in production          │
│     ├─ Firewall rules                   │
│     └─ Rate limiting (optional)         │
│                                          │
└─────────────────────────────────────────┘
```

---

## Performance Optimization

```
┌─────────────────────────────────────────┐
│         Performance Strategy             │
├─────────────────────────────────────────┤
│                                          │
│  Frontend:                              │
│  ├─ Code splitting                      │
│  ├─ Lazy loading                        │
│  ├─ Image optimization (base64)         │
│  ├─ Framer Motion optimization          │
│  └─ WebSocket connection pooling        │
│                                          │
│  Backend:                               │
│  ├─ Compression middleware              │
│  ├─ Connection pooling                  │
│  ├─ Async processing                    │
│  └─ Efficient WebSocket broadcasts      │
│                                          │
│  CV Service:                            │
│  ├─ Frame sampling (every 5th frame)    │
│  ├─ YOLO model caching                  │
│  ├─ Async video processing              │
│  ├─ Batch processing                    │
│  └─ GPU acceleration (optional)         │
│                                          │
│  Database:                              │
│  ├─ Indexed queries                     │
│  ├─ Connection pooling                  │
│  └─ Efficient schema design             │
│                                          │
└─────────────────────────────────────────┘
```

---

These diagrams provide a comprehensive visual understanding of the system architecture, data flow, and component interactions.
