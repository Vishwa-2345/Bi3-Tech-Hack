# Local Development Setup Guide

## Step-by-Step Instructions

### 1. Install Prerequisites

#### Windows:

**Node.js & npm:**
- Download from: https://nodejs.org/ (LTS version)
- Run installer
- Verify: `node --version` and `npm --version`

**Python:**
- Download from: https://www.python.org/downloads/ (3.9+)
- Check "Add Python to PATH" during installation
- Verify: `python --version`

**MongoDB:**
- Download from: https://www.mongodb.com/try/download/community
- Install MongoDB Community Server
- Start MongoDB:
  ```powershell
  # Option 1: As Windows Service (automatic)
  # MongoDB installs as service by default
  
  # Option 2: Manual start
  "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"
  ```

**Git:**
- Download from: https://git-scm.com/download/win
- Install with default settings

---

### 2. Setup Project

#### Navigate to Project:
```powershell
cd "C:\Users\ASUS\Desktop\ClearPath AI Signals"
```

#### Frontend Setup:
```powershell
cd frontend
npm install

# Create .env file
Copy-Item .env.example .env

# Edit .env with your settings (if needed)
```

#### Backend Setup:
```powershell
cd ..\backend
npm install

# Create .env file
Copy-Item .env.example .env

# Edit .env with MongoDB URI
```

#### CV Service Setup:
```powershell
cd ..\cv-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# If you get execution policy error, run:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then activate again
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Create .env file
Copy-Item .env.example .env
```

---

### 3. Start All Services

**Open 4 PowerShell terminals:**

**Terminal 1 - MongoDB** (if not running as service):
```powershell
mongod
```

**Terminal 2 - Backend:**
```powershell
cd "C:\Users\ASUS\Desktop\ClearPath AI Signals\backend"
npm start
```
Wait for: `🚀 Server running on port 5000`

**Terminal 3 - CV Service:**
```powershell
cd "C:\Users\ASUS\Desktop\ClearPath AI Signals\cv-service"
.\venv\Scripts\Activate.ps1
python main.py
```
Wait for: `🚀 CV Service started`

**Terminal 4 - Frontend:**
```powershell
cd "C:\Users\ASUS\Desktop\ClearPath AI Signals\frontend"
npm start
```
Browser opens automatically at `http://localhost:3000`

---

### 4. Test the Application

1. **Upload Videos:**
   - Prepare 4 test videos (or use sample videos)
   - Name them: north.mp4, south.mp4, east.mp4, west.mp4
   - Upload through the UI

2. **Watch Simulation:**
   - Videos process automatically
   - View real-time detections
   - Monitor traffic signals
   - Check alerts panel

---

### 5. Stopping Services

Press `Ctrl+C` in each terminal to stop services.

For MongoDB service:
```powershell
net stop MongoDB
```

---

## Common Issues & Solutions

### Issue: "npm: command not found"
**Solution:** Install Node.js and restart terminal

### Issue: "python: command not found"
**Solution:** Install Python and check "Add to PATH"

### Issue: "Cannot activate virtualenv"
**Solution:** 
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: "MongoDB connection failed"
**Solution:** 
- Check if MongoDB is running: `mongod`
- Or start MongoDB service: `net start MongoDB`
- Check connection string in backend/.env

### Issue: "Port already in use"
**Solution:**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Issue: "YOLO model download fails"
**Solution:**
- Check internet connection
- Model downloads automatically on first run
- Or manually download from: https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.pt
- Place in cv-service folder

---

## Development Tips

### Hot Reload:
- Frontend: Automatic with React
- Backend: Use `nodemon` (install: `npm install -g nodemon`, run: `nodemon server.js`)
- CV Service: Restart manually after changes

### View Logs:
- All services print to console
- MongoDB logs: `C:\Program Files\MongoDB\Server\7.0\log\`

### Database Management:
```powershell
# MongoDB Shell
mongosh

# Use database
use clearpath-ai-signals

# View collections
show collections

# View simulations
db.simulations.find()

# View alerts
db.alerts.find()
```

---

## Environment Variables Reference

### Frontend (.env):
```env
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000
```

### Backend (.env):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/clearpath-ai-signals
CV_SERVICE_URL=http://localhost:8000
NODE_ENV=development
```

### CV Service (.env):
```env
BACKEND_URL=http://localhost:5000
PORT=8000
MODEL_PATH=yolov8n.pt
CONFIDENCE_THRESHOLD=0.5
IOU_THRESHOLD=0.45
```

---

## Testing Checklist

- [ ] MongoDB running
- [ ] Backend starts without errors
- [ ] CV Service starts without errors
- [ ] Frontend opens in browser
- [ ] Can upload 4 videos
- [ ] Videos appear in dashboard
- [ ] YOLO detections visible
- [ ] Traffic signals updating
- [ ] Vehicle counts updating
- [ ] Alerts appearing
- [ ] WebSocket connected (check browser console)

---

## Next Steps

After successful local setup:
1. Test with different videos
2. Monitor system behavior
3. Check all priority modes work
4. Prepare for deployment
5. Review deployment guide

---

## Getting Help

If you encounter issues:
1. Check this guide first
2. Review main README.md
3. Check console logs for errors
4. Verify all prerequisites installed
5. Ensure all .env files created
6. Check firewall/antivirus settings

---

Happy Development! 🚀
