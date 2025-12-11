# Testing Guide

## Preparing Test Videos

### Option 1: Use Sample Videos

Download free traffic videos from:
- **Pexels**: https://www.pexels.com/search/videos/traffic/
- **Pixabay**: https://pixabay.com/videos/search/traffic/
- **Videvo**: https://www.videvo.net/free-video/traffic/

### Option 2: Create Test Videos

Use OBS Studio or phone camera to record:
1. Record 4 different angles of any traffic/objects
2. Each video should be 30-60 seconds
3. Save as MP4 format
4. Name them: north.mp4, south.mp4, east.mp4, west.mp4

### Video Requirements

- **Format**: MP4, AVI, MOV, or MKV
- **Duration**: 10 seconds minimum
- **Size**: Under 500MB per video
- **Resolution**: Any (720p+ recommended)
- **Content**: Should have visible vehicles/people

---

## Local Testing

### 1. Backend Tests

```powershell
cd backend

# Test health endpoint
curl http://localhost:5000/health

# Test MongoDB connection
# Should see: "📦 MongoDB Connected: localhost"
```

### 2. CV Service Tests

```powershell
cd cv-service

# Test health endpoint
curl http://localhost:8000/health

# Should return: {"status":"healthy","model_loaded":true}
```

### 3. Frontend Tests

1. Open http://localhost:3000
2. Should see upload page
3. No console errors

### 4. Upload Test

1. Select 4 test videos
2. Click upload
3. Watch for:
   - Upload progress
   - Automatic redirect to dashboard
   - Video feeds appear
   - YOLO boxes drawn
   - Counts updating
   - Signals changing

---

## Integration Tests

### Test Scenarios

#### Scenario 1: Basic Upload & Processing
1. Upload 4 videos
2. ✅ Videos appear in dashboard
3. ✅ YOLO detections visible
4. ✅ Vehicle counts display
5. ✅ Signals update every 15s

#### Scenario 2: ROI Detection
1. Check each video feed
2. ✅ Purple ROI polygon visible
3. ✅ Only objects inside ROI counted
4. ✅ Objects outside ROI ignored

#### Scenario 3: Signal Logic - Least Traffic
1. Wait for normal operation
2. ✅ Direction with minimum vehicles gets green
3. ✅ Timer counts down from 15
4. ✅ Signal switches after timer expires

#### Scenario 4: Heavy Traffic Mode
1. Use videos with many vehicles
2. ✅ Alert: "⚠ Heavy Traffic — Rotation Mode ON"
3. ✅ Signals rotate: North → East → South → West
4. ✅ Each gets 15 seconds

#### Scenario 5: Pedestrian Priority
1. Use videos with pedestrians
2. ✅ Pedestrian count displays
3. ✅ Alert: "🚶 Pedestrian Crossing Active (15s)"
4. ✅ 15-second crossing time given

#### Scenario 6: WebSocket Connection
1. Open browser console
2. ✅ "WebSocket connected: [id]" message
3. ✅ Real-time updates every ~0.5s
4. ✅ No disconnection errors

---

## Performance Tests

### Metrics to Check

```javascript
// In browser console
console.log('Frame rate:', frameCount / elapsedSeconds);
console.log('Update latency:', Date.now() - lastUpdateTime);
```

**Expected Performance:**
- Frame processing: 8-15 FPS
- Update latency: < 500ms
- WebSocket latency: < 100ms
- CPU usage: 50-70%
- RAM usage: < 2GB

---

## API Tests

### Using cURL

```bash
# Health checks
curl http://localhost:5000/health
curl http://localhost:8000/health

# Upload videos
curl -X POST http://localhost:5000/api/upload-videos \
  -F "north=@north.mp4" \
  -F "south=@south.mp4" \
  -F "east=@east.mp4" \
  -F "west=@west.mp4"

# Get status
curl http://localhost:5000/api/simulation/status
```

### Using Postman

1. Import collection from API.md
2. Set environment variables
3. Run collection tests
4. Check all responses

---

## Database Tests

```javascript
// MongoDB shell
mongosh

use clearpath-ai-signals

// Check simulations
db.simulations.find().pretty()

// Check alerts
db.alerts.find().sort({timestamp: -1}).limit(10).pretty()

// Count documents
db.simulations.countDocuments()
db.alerts.countDocuments()

// Delete test data
db.simulations.deleteMany({})
db.alerts.deleteMany({})
```

---

## Load Testing

### Concurrent Users

Use Apache Bench or Artillery:

```bash
# Install Artillery
npm install -g artillery

# Create test config
# artillery.yml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 5

scenarios:
  - name: 'Upload videos'
    flow:
      - post:
          url: '/api/upload-videos'
          formData:
            north: '@north.mp4'
            south: '@south.mp4'
            east: '@east.mp4'
            west: '@west.mp4'

# Run test
artillery run artillery.yml
```

---

## Error Testing

### Test Error Handling

#### Missing Videos
```bash
# Upload with only 2 videos
curl -X POST http://localhost:5000/api/upload-videos \
  -F "north=@north.mp4" \
  -F "south=@south.mp4"

# Should return: "Missing videos for directions: east, west"
```

#### Invalid File Type
```bash
# Upload non-video file
curl -X POST http://localhost:5000/api/upload-videos \
  -F "north=@document.pdf"

# Should return: "Only video files are allowed!"
```

#### Large File
```bash
# Upload 600MB file (over 500MB limit)
# Should fail with size limit error
```

---

## Browser Compatibility

Test on:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## Automated Tests (Optional)

### Frontend Unit Tests

```bash
cd frontend

# Create test file: src/App.test.js
npm test
```

### Backend Unit Tests

```bash
cd backend

# Install Jest
npm install --save-dev jest supertest

# Create test file: tests/api.test.js
npm test
```

### CV Service Unit Tests

```bash
cd cv-service

# Install pytest
pip install pytest

# Create test file: test_video_processor.py
pytest
```

---

## Monitoring Tests

### Check System Resources

**Windows PowerShell:**
```powershell
# CPU usage
Get-Counter '\Processor(_Total)\% Processor Time'

# Memory usage
Get-Process | Sort-Object -Property WS -Descending | Select-Object -First 10

# Network usage
Get-NetAdapterStatistics
```

---

## Regression Testing

Before deploying updates:
1. ✅ Run all test scenarios
2. ✅ Check no new console errors
3. ✅ Verify performance metrics
4. ✅ Test on multiple browsers
5. ✅ Check database integrity
6. ✅ Verify API responses
7. ✅ Test WebSocket stability

---

## Bug Reporting Template

```markdown
## Bug Report

**Title:** [Brief description]

**Environment:**
- OS: Windows/Mac/Linux
- Browser: Chrome 120.0
- Node version: 18.0.0
- Python version: 3.9.0

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots:**
[If applicable]

**Console Errors:**
```
[Error messages]
```

**Additional Context:**
[Any other information]
```

---

## Test Checklist

### Before Release

- [ ] All services start without errors
- [ ] Video upload works
- [ ] YOLO detection visible
- [ ] ROI filtering active
- [ ] Vehicle counting accurate
- [ ] Signal logic correct
- [ ] All 4 priority modes work
- [ ] Alerts display properly
- [ ] WebSocket stable
- [ ] No memory leaks
- [ ] Performance acceptable
- [ ] Database operations work
- [ ] API responses correct
- [ ] Error handling works
- [ ] Browser compatibility checked
- [ ] Mobile responsive
- [ ] Documentation complete

---

## Test Results Template

```markdown
## Test Session: [Date]

**Tester:** [Name]
**Duration:** [Time]
**Environment:** [Dev/Staging/Prod]

### Results

| Test Case | Status | Notes |
|-----------|--------|-------|
| Upload videos | ✅ Pass | |
| YOLO detection | ✅ Pass | |
| ROI filtering | ✅ Pass | |
| Signal logic | ✅ Pass | |
| WebSocket | ⚠️ Warning | Occasional disconnects |
| Performance | ✅ Pass | 12 FPS average |

### Issues Found
1. [Issue description]
2. [Issue description]

### Recommendations
- [Recommendation 1]
- [Recommendation 2]
```

---

Happy Testing! 🧪
