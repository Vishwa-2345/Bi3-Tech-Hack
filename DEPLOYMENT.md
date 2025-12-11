# Deployment Guide - ClearPath AI Signals

## Complete Deployment to Production

### Overview
This guide covers deploying all three services independently without Docker:
- Frontend → Netlify/Vercel
- Backend → Render/Railway
- CV Service → Render/Railway
- Database → MongoDB Atlas

---

## 1. MongoDB Atlas Setup

### Create Database:

1. **Sign up**: https://www.mongodb.com/cloud/atlas
2. **Create Cluster**:
   - Choose FREE tier (M0)
   - Select region closest to your backend
   - Name: `clearpath-ai-signals`
3. **Database Access**:
   - Add user with password
   - Save credentials securely
4. **Network Access**:
   - Allow access from anywhere: `0.0.0.0/0`
   - Or specify your deployment IPs
5. **Get Connection String**:
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/clearpath-ai-signals`

---

## 2. Backend Deployment (Render)

### Steps:

1. **Push to GitHub**:
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Backend initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Render Setup**:
   - Go to: https://render.com
   - Sign up / Log in
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Select `backend` folder

3. **Configuration**:
   - **Name**: `clearpath-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

4. **Environment Variables**:
   ```
   PORT=5000
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   CV_SERVICE_URL=<will-add-after-cv-service-deployed>
   NODE_ENV=production
   ```

5. **Deploy**: Click "Create Web Service"

6. **Note URL**: Save the deployed URL (e.g., `https://clearpath-backend.onrender.com`)

---

## 3. CV Service Deployment (Render)

### Steps:

1. **Push to GitHub** (if separate repo):
   ```bash
   cd cv-service
   git init
   git add .
   git commit -m "CV Service initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Render Setup**:
   - Click "New +" → "Web Service"
   - Connect repository
   - Select `cv-service` folder

3. **Configuration**:
   - **Name**: `clearpath-cv-service`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python main.py`
   - **Instance Type**: Free or Starter (Starter recommended for better performance)

4. **Environment Variables**:
   ```
   BACKEND_URL=<your-backend-url-from-step-2>
   PORT=8000
   MODEL_PATH=yolov8n.pt
   CONFIDENCE_THRESHOLD=0.5
   IOU_THRESHOLD=0.45
   ```

5. **Deploy**: Click "Create Web Service"

6. **Note URL**: Save the deployed URL (e.g., `https://clearpath-cv.onrender.com`)

7. **Update Backend**:
   - Go back to Render backend service
   - Add environment variable:
     ```
     CV_SERVICE_URL=<your-cv-service-url>
     ```
   - Redeploy backend

---

## 4. Frontend Deployment (Netlify)

### Steps:

1. **Build Frontend**:
   ```bash
   cd frontend
   
   # Create production .env
   echo "REACT_APP_BACKEND_URL=<your-backend-url>" > .env.production
   echo "REACT_APP_WS_URL=<your-backend-websocket-url>" >> .env.production
   
   # Build
   npm run build
   ```

2. **Netlify Setup**:
   - Go to: https://www.netlify.com
   - Sign up / Log in
   - Drag and drop `build` folder to Netlify
   
   **OR use Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod --dir=build
   ```

3. **Environment Variables** (if using Git deployment):
   - Go to Site Settings → Environment Variables
   - Add:
     ```
     REACT_APP_BACKEND_URL=<your-backend-url>
     REACT_APP_WS_URL=<your-backend-websocket-url>
     ```

4. **Custom Domain** (optional):
   - Domain Settings → Add custom domain

5. **Note URL**: Your app is live! (e.g., `https://clearpath-ai.netlify.app`)

---

## Alternative: Frontend on Vercel

### Steps:

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   cd frontend
   vercel login
   vercel --prod
   ```

3. **Environment Variables**:
   - Add in Vercel dashboard
   - Or use CLI:
     ```bash
     vercel env add REACT_APP_BACKEND_URL production
     vercel env add REACT_APP_WS_URL production
     ```

---

## Alternative: Backend/CV on Railway

### Backend on Railway:

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy**:
   ```bash
   cd backend
   railway login
   railway init
   railway up
   ```

3. **Add Variables**:
   ```bash
   railway variables set MONGODB_URI=<your-mongodb-uri>
   railway variables set CV_SERVICE_URL=<cv-service-url>
   railway variables set NODE_ENV=production
   ```

### CV Service on Railway:

1. **Deploy**:
   ```bash
   cd cv-service
   railway init
   railway up
   ```

2. **Add Variables**:
   ```bash
   railway variables set BACKEND_URL=<backend-url>
   railway variables set MODEL_PATH=yolov8n.pt
   ```

---

## 5. Post-Deployment Configuration

### Update All URLs:

1. **Frontend** → Update with backend URL
2. **Backend** → Update with CV service URL
3. **CV Service** → Update with backend URL

### CORS Configuration:

Update backend `server.js`:
```javascript
app.use(cors({
  origin: [
    'https://your-frontend-url.netlify.app',
    'http://localhost:3000' // for local testing
  ],
  credentials: true
}));

const io = socketIo(server, {
  cors: {
    origin: [
      'https://your-frontend-url.netlify.app',
      'http://localhost:3000'
    ],
    methods: ['GET', 'POST']
  }
});
```

---

## 6. Testing Production Deployment

### Checklist:

- [ ] Frontend loads correctly
- [ ] Can access upload page
- [ ] Upload 4 videos successfully
- [ ] Videos process without errors
- [ ] Dashboard displays live feeds
- [ ] YOLO detections visible
- [ ] Traffic signals update
- [ ] Vehicle counts update
- [ ] Alerts appear
- [ ] WebSocket connection stable
- [ ] No console errors

### Test URLs:
```
Frontend: https://your-app.netlify.app
Backend: https://clearpath-backend.onrender.com/health
CV Service: https://clearpath-cv.onrender.com/health
```

---

## 7. Monitoring & Logs

### Render:
- Dashboard → Select service → Logs tab
- Real-time log streaming
- Download logs for debugging

### Netlify:
- Site → Deploys → View logs
- Function logs (if using functions)

### MongoDB Atlas:
- Monitoring tab → View metrics
- Slow query analysis
- Connection statistics

---

## 8. Performance Optimization

### Backend:
- Enable compression
- Use Redis for caching (optional)
- Implement rate limiting

### CV Service:
- Use GPU instances for faster processing
- Implement queue system for multiple sessions
- Cache model in memory

### Frontend:
- Enable gzip compression
- Use CDN for static assets
- Implement lazy loading

---

## 9. Cost Estimation

### Free Tier Limits:

**Render Free:**
- 750 hours/month per service
- Sleeps after 15 min inactivity
- 512 MB RAM

**Netlify Free:**
- 100 GB bandwidth/month
- Unlimited sites

**MongoDB Atlas Free:**
- 512 MB storage
- Shared cluster

### Upgrade Recommendations:

For production traffic:
- **Backend**: Render Starter ($7/month)
- **CV Service**: Render Starter+ ($25/month) - needs more resources
- **MongoDB**: M10 cluster ($57/month)
- **Total**: ~$90/month

---

## 10. Backup & Recovery

### Database Backups:
```bash
# MongoDB Atlas automatic backups available in paid tiers
# Manual backup:
mongodump --uri="<your-mongodb-uri>" --out=./backup
```

### Code Backups:
- Use Git version control
- Multiple GitHub repositories
- Regular commits

---

## 11. Security Best Practices

### Environment Variables:
- Never commit .env files
- Use secrets management
- Rotate credentials regularly

### API Security:
- Implement rate limiting
- Add authentication (if needed)
- Validate all inputs
- Sanitize uploaded files

### Database:
- Use strong passwords
- Restrict network access
- Enable encryption at rest

---

## 12. Scaling Considerations

### Horizontal Scaling:
- Load balancer for backend
- Multiple CV service instances
- Database replication

### Vertical Scaling:
- Upgrade instance types
- More CPU/RAM for CV processing
- GPU instances for YOLO

---

## 13. CI/CD Pipeline (Optional)

### GitHub Actions Example:

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Netlify
        run: |
          cd frontend
          npm install
          npm run build
          npx netlify-cli deploy --prod --dir=build
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## 14. Troubleshooting Production

### Common Issues:

**Video upload fails:**
- Check file size limits on hosting
- Verify network bandwidth
- Increase timeout settings

**WebSocket disconnects:**
- Check hosting WebSocket support
- Verify CORS settings
- Use sticky sessions

**CV processing slow:**
- Upgrade to GPU instance
- Optimize batch processing
- Reduce frame processing rate

**High latency:**
- Use CDN
- Deploy services in same region
- Optimize database queries

---

## 15. Maintenance

### Regular Tasks:
- Monitor error logs daily
- Check resource usage weekly
- Update dependencies monthly
- Review security patches
- Backup database regularly

### Updates:
```bash
# Update backend
cd backend
npm update
npm audit fix

# Update CV service
cd cv-service
pip list --outdated
pip install --upgrade <package>

# Update frontend
cd frontend
npm update
```

---

## Support & Resources

### Documentation:
- [Render Docs](https://render.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)
- [Railway Docs](https://docs.railway.app)

### Community:
- GitHub Issues
- Stack Overflow
- Discord communities

---

## Deployment Summary

✅ **Deployed Services:**
1. MongoDB Atlas (Database)
2. Render/Railway (Backend)
3. Render/Railway (CV Service)
4. Netlify/Vercel (Frontend)

✅ **Total Setup Time:** 2-3 hours

✅ **Free Tier Available:** Yes (with limitations)

✅ **Production Ready:** Yes

---

**🎉 Your ClearPath AI Signals system is now live and serving traffic intelligence globally!**
