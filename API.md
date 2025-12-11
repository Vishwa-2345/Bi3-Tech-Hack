# API Documentation

## Backend REST API

### Base URL
```
Development: http://localhost:5000
Production: https://your-backend-url.onrender.com
```

---

## Endpoints

### 1. Health Check

**GET** `/health`

Returns server health status.

**Response:**
```json
{
  "status": "ok",
  "message": "ClearPath AI Signals Backend is running"
}
```

---

### 2. Upload Videos

**POST** `/api/upload-videos`

Upload 4 directional traffic videos.

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `north`: Video file (required)
- `south`: Video file (required)
- `east`: Video file (required)
- `west`: Video file (required)

**Example (cURL):**
```bash
curl -X POST http://localhost:5000/api/upload-videos \
  -F "north=@north.mp4" \
  -F "south=@south.mp4" \
  -F "east=@east.mp4" \
  -F "west=@west.mp4"
```

**Response:**
```json
{
  "success": true,
  "message": "Videos uploaded successfully. Simulation starting...",
  "sessionId": "session-1702345678901",
  "videoPaths": {
    "north": "/path/to/north.mp4",
    "south": "/path/to/south.mp4",
    "east": "/path/to/east.mp4",
    "west": "/path/to/west.mp4"
  }
}
```

**Error Response:**
```json
{
  "error": "Missing videos for directions: north, south"
}
```

---

### 3. Get Simulation Status

**GET** `/api/simulation/status`

Get current simulation status.

**Response:**
```json
{
  "status": "processing",
  "sessionId": "session-1702345678901",
  "currentState": {
    "counts": {
      "north": 12,
      "south": 8,
      "east": 15,
      "west": 5
    },
    "signalState": {
      "north": "red",
      "south": "red",
      "east": "red",
      "west": "green",
      "activeDirection": "west",
      "timer": 12
    }
  },
  "startedAt": "2024-12-11T10:30:00.000Z"
}
```

---

### 4. Get Simulation by ID

**GET** `/api/simulation/:sessionId`

Get specific simulation details.

**Response:**
```json
{
  "_id": "...",
  "sessionId": "session-1702345678901",
  "videos": {
    "north": "/path/to/north.mp4",
    "south": "/path/to/south.mp4",
    "east": "/path/to/east.mp4",
    "west": "/path/to/west.mp4"
  },
  "status": "processing",
  "currentState": { ... },
  "startedAt": "2024-12-11T10:30:00.000Z",
  "createdAt": "2024-12-11T10:30:00.000Z",
  "updatedAt": "2024-12-11T10:31:00.000Z"
}
```

---

### 5. Get Session Alerts

**GET** `/api/simulation/:sessionId/alerts`

Get alerts for a specific session.

**Response:**
```json
[
  {
    "_id": "...",
    "sessionId": "session-1702345678901",
    "alertType": "ambulance",
    "message": "🚑 Ambulance Priority Enabled",
    "direction": "north",
    "timestamp": "2024-12-11T10:32:00.000Z"
  },
  {
    "alertType": "pedestrian",
    "message": "🚶 Pedestrian Crossing Active (15s)",
    "direction": "south",
    "timestamp": "2024-12-11T10:33:00.000Z"
  }
]
```

---

### 6. Update Simulation (Internal - CV Service)

**POST** `/api/simulation/update`

Update simulation state. Called by CV service.

**Request Body:**
```json
{
  "session_id": "session-1702345678901",
  "counts": {
    "north": 12,
    "south": 8,
    "east": 15,
    "west": 5
  },
  "signal_state": {
    "north": "red",
    "south": "red",
    "east": "red",
    "west": "green",
    "activeDirection": "west",
    "timer": 12
  },
  "frames": {
    "north": "base64_encoded_image...",
    "south": "base64_encoded_image...",
    "east": "base64_encoded_image...",
    "west": "base64_encoded_image..."
  }
}
```

**Response:**
```json
{
  "success": true
}
```

---

### 7. Create Alert (Internal - CV Service)

**POST** `/api/simulation/alert`

Create system alert. Called by CV service.

**Request Body:**
```json
{
  "session_id": "session-1702345678901",
  "alert_type": "ambulance",
  "message": "🚑 Ambulance detected in North direction",
  "direction": "north",
  "metadata": {
    "vehicle_count": 1
  }
}
```

**Response:**
```json
{
  "success": true
}
```

---

## CV Service API

### Base URL
```
Development: http://localhost:8000
Production: https://your-cv-service-url.onrender.com
```

---

### 1. Health Check

**GET** `/health`

Returns CV service health status.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

---

### 2. Process Videos

**POST** `/api/process-videos`

Process uploaded videos with YOLO detection.

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `north`: Video file (required)
- `south`: Video file (required)
- `east`: Video file (required)
- `west`: Video file (required)
- `session_id`: String (required)

**Response:**
```json
{
  "success": true,
  "message": "Videos received and processing started",
  "session_id": "session-1702345678901"
}
```

---

## WebSocket Events

### Connection

**URL:** `ws://localhost:5000` or `wss://your-backend-url`

**Client Events:**
- `connect`: Fired when connection established
- `disconnect`: Fired when connection closed

**Server Events:**

#### simulation_update
Real-time simulation state update.

**Payload:**
```json
{
  "counts": {
    "north": 12,
    "south": 8,
    "east": 15,
    "west": 5
  },
  "signalState": {
    "north": "red",
    "south": "red",
    "east": "red",
    "west": "green",
    "activeDirection": "west",
    "timer": 12
  },
  "frames": {
    "north": "base64_encoded_image...",
    "south": "base64_encoded_image...",
    "east": "base64_encoded_image...",
    "west": "base64_encoded_image..."
  }
}
```

#### alert
System alert notification.

**Payload:**
```json
{
  "alertType": "ambulance",
  "message": "🚑 Ambulance Priority Enabled",
  "direction": "north",
  "timestamp": "2024-12-11T10:32:00.000Z"
}
```

---

## Data Models

### Simulation Model

```javascript
{
  sessionId: String (unique),
  videos: {
    north: String,
    south: String,
    east: String,
    west: String
  },
  status: "pending" | "processing" | "completed" | "failed",
  startedAt: Date,
  completedAt: Date,
  currentState: {
    counts: {
      north: Number,
      south: Number,
      east: Number,
      west: Number
    },
    signalState: {
      north: "red" | "green",
      south: "red" | "green",
      east: "red" | "green",
      west: "red" | "green",
      activeDirection: String,
      timer: Number
    }
  },
  timestamps: true
}
```

### Alert Model

```javascript
{
  sessionId: String,
  alertType: "ambulance" | "pedestrian" | "heavy_traffic" | "warning" | "info",
  message: String,
  direction: String,
  metadata: Mixed,
  timestamp: Date,
  timestamps: true
}
```

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Missing required fields or invalid data |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error occurred |

---

## Rate Limiting

Currently no rate limiting implemented. For production, consider:
- 100 requests per 15 minutes per IP
- Special limits for video uploads

---

## Authentication

Current version: No authentication required.

For production, implement:
- API keys
- JWT tokens
- OAuth2

---

## CORS Policy

Development: All origins allowed
Production: Whitelist specific domains

---

## Testing with Postman

Import collection:

```json
{
  "info": {
    "name": "ClearPath AI Signals",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Upload Videos",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/api/upload-videos",
        "body": {
          "mode": "formdata",
          "formdata": [
            {"key": "north", "type": "file"},
            {"key": "south", "type": "file"},
            {"key": "east", "type": "file"},
            {"key": "west", "type": "file"}
          ]
        }
      }
    },
    {
      "name": "Get Status",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/simulation/status"
      }
    }
  ]
}
```

---

## Example Usage (JavaScript)

```javascript
// Upload videos
const formData = new FormData();
formData.append('north', northFile);
formData.append('south', southFile);
formData.append('east', eastFile);
formData.append('west', westFile);

const response = await fetch('http://localhost:5000/api/upload-videos', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data.sessionId);

// Connect WebSocket
const socket = io('http://localhost:5000');

socket.on('simulation_update', (data) => {
  console.log('Update:', data);
});

socket.on('alert', (alert) => {
  console.log('Alert:', alert);
});
```

---

## Performance Considerations

- Video upload limit: 500MB per file
- Processing time: ~real-time (depends on video length)
- WebSocket update frequency: Every 5 frames
- Frame processing: ~10 FPS

---

## Support

For API issues:
- Check endpoint URL
- Verify request format
- Review error messages
- Check server logs
