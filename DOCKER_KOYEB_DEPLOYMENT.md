# Docker & Koyeb Deployment Guide for WhatsApp Bot

This guide provides complete instructions for deploying the WhatsApp Bot application using Docker, both locally and on Koyeb cloud platform.

---

## 📋 Table of Contents

1. [Local Docker Deployment](#local-docker-deployment)
2. [Koyeb Cloud Deployment](#koyeb-cloud-deployment)
3. [Environment Variables](#environment-variables)
4. [Persistent Storage](#persistent-storage)
5. [Troubleshooting](#troubleshooting)

---

## 🐳 Local Docker Deployment

### Prerequisites
- Docker installed (version 20.10+)
- Docker Compose installed (optional, for easier management)

### Option 1: Using Docker CLI

#### 1. Build the Docker Image

```bash
docker build -t whatsapp-bot:latest .
```

#### 2. Run the Container

```bash
docker run -d \
  --name whatsapp-bot \
  -p 5000:5000 \
  -v $(pwd)/whatsapp-data:/app/.wwebjs_auth \
  -e PORT=5000 \
  -e NODE_ENV=production \
  --restart unless-stopped \
  whatsapp-bot:latest
```

#### 3. View Logs

```bash
docker logs -f whatsapp-bot
```

#### 4. Stop the Container

```bash
docker stop whatsapp-bot
docker rm whatsapp-bot
```

---

### Option 2: Using Docker Compose

#### 1. Create `docker-compose.yml`

```yaml
version: '3.8'

services:
  whatsapp-bot:
    build: .
    container_name: whatsapp-bot
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - NODE_ENV=production
      - SESSION_SECRET=your-random-secret-key-here
    volumes:
      # Persistent storage for WhatsApp session data
      - whatsapp-auth:/app/.wwebjs_auth
      - whatsapp-cache:/app/.wwebjs_cache
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:5000/api/session', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

volumes:
  whatsapp-auth:
    driver: local
  whatsapp-cache:
    driver: local
```

#### 2. Start Services

```bash
docker-compose up -d
```

#### 3. View Logs

```bash
docker-compose logs -f whatsapp-bot
```

#### 4. Stop Services

```bash
docker-compose down
```

#### 5. Stop and Remove Data (Complete Reset)

```bash
docker-compose down -v
```

---

## ☁️ Koyeb Cloud Deployment

Koyeb is a serverless platform that supports Docker containers with persistent storage.

### Prerequisites
- Koyeb account (sign up at https://app.koyeb.com)
- GitHub repository with your WhatsApp bot code
- Koyeb CLI installed (optional)

---

### Method 1: Deploy via Koyeb Web UI

#### Step 1: Prepare Your Repository

1. **Push your code to GitHub** with these files:
   - `Dockerfile`
   - `.dockerignore`
   - All application code

2. **Commit the Dockerfile** to your repository:
```bash
git add Dockerfile .dockerignore
git commit -m "Add Docker configuration for Koyeb deployment"
git push origin main
```

#### Step 2: Create a Koyeb Service

1. **Login to Koyeb**: https://app.koyeb.com
2. **Create a new Service**:
   - Click **"Create Service"**
   - Choose **"GitHub"** as deployment method

3. **Configure GitHub Integration**:
   - Authorize Koyeb to access your GitHub
   - Select your repository
   - Select branch: `main` (or your default branch)

4. **Configure Builder**:
   - Builder: Select **"Dockerfile"**
   - Dockerfile path: `Dockerfile` (default)
   - Build context: `.` (default)

5. **Configure Service Settings**:

   **Instance Type:**
   - Select **"Nano"** or **"Micro"** (sufficient for most use cases)
   
   **Regions:**
   - Select region closest to your users (e.g., `fra` for Europe, `was` for US East)

   **Environment Variables:**
   ```
   PORT=5000
   NODE_ENV=production
   SESSION_SECRET=your-random-secret-key-change-this
   ```

6. **Configure Persistent Storage** (CRITICAL):

   Koyeb now supports persistent volumes. Configure two volumes:

   **Volume 1: WhatsApp Auth Data**
   - Name: `whatsapp-auth`
   - Mount path: `/app/.wwebjs_auth`
   - Size: `1 GB`

   **Volume 2: WhatsApp Cache**
   - Name: `whatsapp-cache`
   - Mount path: `/app/.wwebjs_cache`
   - Size: `1 GB`

   > ⚠️ **IMPORTANT**: Without persistent volumes, your WhatsApp session will be lost on every deployment, requiring you to scan the QR code again.

7. **Configure Ports**:
   - Public Port: `5000`
   - Protocol: `HTTP`
   - Path: `/`

8. **Configure Health Checks** (Automatic):
   - Koyeb will use the `HEALTHCHECK` defined in Dockerfile
   - Health check endpoint: `/api/session`

9. **Deploy**:
   - Review all settings
   - Click **"Deploy"**

#### Step 3: Monitor Deployment

1. **View deployment logs** in real-time
2. Wait for build to complete (3-5 minutes)
3. Wait for health checks to pass (1-2 minutes)

#### Step 4: Access Your Application

Once deployed, Koyeb provides a URL:
```
https://your-service-name-your-org.koyeb.app
```

Navigate to this URL and scan the QR code to authenticate WhatsApp.

---

### Method 2: Deploy via Koyeb CLI

#### Step 1: Install Koyeb CLI

**macOS/Linux:**
```bash
curl -fsSL https://koyeb.com/cli/install.sh | sh
```

**Windows:**
Download from: https://github.com/koyeb/koyeb-cli/releases

#### Step 2: Authenticate

```bash
koyeb init
```

Generate an API token from: https://app.koyeb.com/settings/api

#### Step 3: Create Service with CLI

Create a `koyeb.yaml` configuration file:

```yaml
services:
  - name: whatsapp-bot
    git:
      repository: github.com/your-username/your-repo
      branch: main
    builder: dockerfile
    dockerfile: Dockerfile
    instance_type: nano
    regions:
      - fra
    ports:
      - port: 5000
        protocol: http
    routes:
      - path: /
        port: 5000
    env:
      - name: PORT
        value: "5000"
      - name: NODE_ENV
        value: production
      - name: SESSION_SECRET
        type: secret
        value: your-secret-key-here
    volumes:
      - name: whatsapp-auth
        path: /app/.wwebjs_auth
        size: 1GB
      - name: whatsapp-cache
        path: /app/.wwebjs_cache
        size: 1GB
    healthcheck:
      http:
        port: 5000
        path: /api/session
```

#### Step 4: Deploy

```bash
koyeb service create --yaml koyeb.yaml
```

#### Step 5: Monitor Logs

```bash
koyeb service logs whatsapp-bot --follow
```

---

### Method 3: Deploy Pre-Built Docker Image

If you've already built and pushed your image to Docker Hub or another registry:

```bash
koyeb service create whatsapp-bot \
  --docker docker.io/your-username/whatsapp-bot:latest \
  --port 5000:http \
  --route /:5000 \
  --env PORT=5000 \
  --env NODE_ENV=production \
  --instance-type nano \
  --region fra
```

---

## 🔐 Environment Variables

Configure these environment variables in your deployment:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | Port the server listens on |
| `NODE_ENV` | No | `development` | Environment mode (`production` recommended) |
| `SESSION_SECRET` | Yes | - | Secret key for session management (use random string) |

### Generate a Secure SESSION_SECRET

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Example output:
# K7x9mP2nR5vW8qL3jF6hT4bN0zC1yA8s
```

---

## 💾 Persistent Storage

### Why Persistent Storage is Critical

WhatsApp Web.js stores authentication session data in:
- `.wwebjs_auth/` - Session credentials and authentication state
- `.wwebjs_cache/` - Message cache and temporary data

**Without persistent storage:**
- ❌ Session lost on every deployment/restart
- ❌ Must scan QR code after every update
- ❌ Lose message history

**With persistent storage:**
- ✅ Session survives deployments
- ✅ QR code scan only once
- ✅ Maintain message history

### Koyeb Volume Configuration

When creating volumes in Koyeb:

1. **Volume Names**: Use descriptive names
   - `whatsapp-auth` for session data
   - `whatsapp-cache` for cache data

2. **Mount Paths**: Must match exactly
   - `/app/.wwebjs_auth`
   - `/app/.wwebjs_cache`

3. **Size**: 1GB per volume is sufficient

4. **Persistence**: Volumes persist across deployments

### Backup Your Session Data

To backup your authenticated session:

```bash
# Download from Koyeb (if SSH access available)
koyeb service exec whatsapp-bot -- tar -czf /tmp/backup.tar.gz .wwebjs_auth .wwebjs_cache

# Or use Docker volume backup locally
docker run --rm -v whatsapp-auth:/data -v $(pwd):/backup \
  alpine tar -czf /backup/whatsapp-auth-backup.tar.gz -C /data .
```

---

## 🔍 Monitoring & Health Checks

### Health Check Endpoint

The application provides a health check at:
```
GET /api/session
```

**Healthy Response (200 OK):**
```json
{
  "isConnected": true,
  "phoneNumber": "918590000953",
  "qrCode": null
}
```

**Unhealthy Response (200 OK but disconnected):**
```json
{
  "isConnected": false,
  "phoneNumber": null,
  "qrCode": "data:image/png;base64,..."
}
```

### Monitor Your Deployment

#### Via Koyeb Dashboard
- View real-time logs
- Monitor health status
- Check resource usage (CPU, memory)
- View deployment history

#### Via Koyeb CLI
```bash
# View logs
koyeb service logs whatsapp-bot --follow

# Get service status
koyeb service get whatsapp-bot

# Restart service
koyeb service restart whatsapp-bot
```

---

## 🔧 Troubleshooting

### Issue: Container Starts but WhatsApp Won't Connect

**Symptoms:**
- Container is running
- No QR code appears
- Logs show Chromium errors

**Solution:**
```bash
# Check logs for Chromium errors
docker logs whatsapp-bot | grep -i chromium

# Ensure Chromium is installed in container
docker exec whatsapp-bot which chromium

# Verify puppeteer configuration
docker exec whatsapp-bot node -e "console.log(require('puppeteer').executablePath())"
```

---

### Issue: Session Lost After Restart

**Symptoms:**
- Must scan QR code after every deployment
- `.wwebjs_auth` folder is empty

**Solution:**
- Verify volumes are configured correctly in Koyeb
- Check mount paths are exactly `/app/.wwebjs_auth`
- Ensure volumes are persistent (not ephemeral)

**Verify volumes in Docker:**
```bash
docker volume ls
docker volume inspect whatsapp-auth
```

---

### Issue: Port Already in Use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use a different port
docker run -p 3000:5000 whatsapp-bot:latest
```

---

### Issue: Out of Memory on Koyeb

**Symptoms:**
- Container crashes randomly
- Logs show memory errors
- Chromium crashes

**Solution:**
1. Upgrade to larger instance type (Micro or Small)
2. Monitor memory usage:
```bash
koyeb service metrics whatsapp-bot
```

---

### Issue: Cannot Access Web Interface

**Symptoms:**
- Service is running but URL returns 404 or timeout

**Solution:**
1. **Check if service is healthy:**
```bash
koyeb service get whatsapp-bot
```

2. **Verify port configuration:**
   - Ensure port 5000 is exposed
   - Check route is set to `/`

3. **Test locally first:**
```bash
curl http://localhost:5000/api/session
```

---

### Issue: QR Code Not Displaying

**Symptoms:**
- Web interface loads but QR code section is blank
- `/api/session` returns `qrCode: null`

**Solution:**
1. **Check WhatsApp initialization:**
```bash
docker logs whatsapp-bot | grep -i "qr\|ready\|auth"
```

2. **Expected log sequence:**
```
Initializing WhatsApp service...
Using system Chromium at: /usr/bin/chromium
Starting WhatsApp client initialization...
QR code received
```

3. **Restart if stuck:**
```bash
# Koyeb
koyeb service restart whatsapp-bot

# Docker
docker restart whatsapp-bot
```

---

## 🚀 Production Best Practices

### 1. Security

- [ ] Change default `SESSION_SECRET` to a strong random value
- [ ] Enable HTTPS (Koyeb provides this automatically)
- [ ] Restrict API access using reverse proxy with authentication
- [ ] Don't expose WhatsApp bot directly to public internet
- [ ] Use environment variables for all secrets (never hardcode)

### 2. Monitoring

- [ ] Set up uptime monitoring (e.g., UptimeRobot, Pingdom)
- [ ] Configure alerts for when WhatsApp disconnects
- [ ] Monitor logs for errors and rate limiting
- [ ] Track API usage and response times

### 3. Backup

- [ ] Regularly backup `.wwebjs_auth` volume
- [ ] Document QR code scanning procedure
- [ ] Keep backup admin phone number ready
- [ ] Test restore procedure

### 4. Scaling

- [ ] Start with Nano/Micro instance
- [ ] Monitor resource usage
- [ ] Upgrade if needed (memory or CPU constraints)
- [ ] Consider multiple instances for high availability (requires session sharing)

### 5. Updates

- [ ] Use CI/CD for automated deployments
- [ ] Test updates in staging environment first
- [ ] Plan maintenance windows for updates
- [ ] Keep WhatsApp Web.js library updated

---

## 📊 Resource Requirements

### Minimum Requirements (Koyeb Nano)
- **CPU**: 0.1 vCPU
- **Memory**: 512 MB
- **Storage**: 2 GB (for volumes)
- **Suitable for**: Testing, low-volume messaging (<100 messages/day)

### Recommended (Koyeb Micro)
- **CPU**: 0.2 vCPU
- **Memory**: 1 GB
- **Storage**: 5 GB
- **Suitable for**: Production, moderate messaging (100-1000 messages/day)

### High Volume (Koyeb Small)
- **CPU**: 0.5 vCPU
- **Memory**: 2 GB
- **Storage**: 10 GB
- **Suitable for**: High volume (1000+ messages/day)

---

## 🔗 Useful Commands Cheat Sheet

```bash
# Local Docker
docker build -t whatsapp-bot .
docker run -d -p 5000:5000 --name whatsapp-bot whatsapp-bot
docker logs -f whatsapp-bot
docker stop whatsapp-bot
docker rm whatsapp-bot

# Docker Compose
docker-compose up -d
docker-compose logs -f
docker-compose down
docker-compose down -v  # Remove volumes too

# Koyeb CLI
koyeb service create --yaml koyeb.yaml
koyeb service logs whatsapp-bot --follow
koyeb service restart whatsapp-bot
koyeb service delete whatsapp-bot

# Health Check
curl http://localhost:5000/api/session
curl https://your-app.koyeb.app/api/session
```

---

## 📞 Support & Next Steps

- **Test your deployment**: Send a test message via API
- **Integrate with PHP**: See `PHP_INTEGRATION_GUIDE.md`
- **Monitor logs**: Regularly check for errors
- **Setup alerts**: Get notified of disconnections

**Deployment URL**: `https://your-service-name.koyeb.app`

**API Endpoint**: `https://your-service-name.koyeb.app/api/send-message`

---

**Ready to deploy!** 🚀 Follow the steps above and your WhatsApp bot will be live in minutes.
