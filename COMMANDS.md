# Quick Start Commands

## Development

### Start All Services (Windows PowerShell)

```powershell
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - CV Service
cd cv-service
.\venv\Scripts\Activate.ps1
python main.py

# Terminal 3 - Frontend
cd frontend
npm start
```

### First Time Setup

```powershell
# Frontend
cd frontend
npm install
Copy-Item .env.example .env

# Backend
cd backend
npm install
Copy-Item .env.example .env

# CV Service
cd cv-service
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

## Production Build

```powershell
# Frontend build
cd frontend
npm run build

# Backend (no build needed)
cd backend
npm start

# CV Service (no build needed)
cd cv-service
python main.py
```

## Useful Commands

### Database
```powershell
# Start MongoDB
mongod

# MongoDB shell
mongosh

# View database
use clearpath-ai-signals
db.simulations.find()
```

### Check Ports
```powershell
# Check if port is in use
netstat -ano | findstr :3000
netstat -ano | findstr :5000
netstat -ano | findstr :8000
```

### Kill Process
```powershell
# Kill process by PID
taskkill /PID <PID> /F
```

## URLs
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- CV Service: http://localhost:8000
- MongoDB: mongodb://localhost:27017
