# WhatsApp Bot Application

A production-ready WhatsApp messaging bot with web interface and REST API for automated customer communications.

## 🚀 Features

- **QR Code Authentication**: Easy WhatsApp Web login via QR code scanning
- **Web Interface**: Beautiful dashboard to manage WhatsApp connections and messages
- **REST API**: Send messages programmatically from any application (PHP, Python, etc.)
- **Real-time Updates**: WebSocket-powered live message updates
- **Session Persistence**: Maintain WhatsApp connection across restarts
- **Contact Management**: View and interact with all WhatsApp contacts
- **Message History**: Access conversation history for all contacts

## 📋 What's Included

This repository contains:

1. **Node.js Backend**: Express server with WhatsApp Web.js integration
2. **React Frontend**: Modern web interface for managing WhatsApp
3. **REST API**: HTTP endpoints for external integrations
4. **WebSocket Server**: Real-time message notifications
5. **Docker Configuration**: Production-ready containerization
6. **Deployment Guides**: Complete instructions for Koyeb cloud deployment
7. **PHP Integration Guide**: Ready-to-use code for PHP applications

## 📁 Documentation

| Document | Purpose |
|----------|---------|
| **[PHP_INTEGRATION_GUIDE.md](PHP_INTEGRATION_GUIDE.md)** | Complete guide to integrate WhatsApp API into PHP applications with code examples |
| **[DOCKER_KOYEB_DEPLOYMENT.md](DOCKER_KOYEB_DEPLOYMENT.md)** | Step-by-step Docker and Koyeb cloud deployment instructions |
| **[AGENT_HANDOFF_PROMPT.txt](AGENT_HANDOFF_PROMPT.txt)** | Concise prompt for developers/agents implementing PHP integration |

## 🏃 Quick Start

### Local Development

1. **Install Dependencies**
```bash
npm install
```

2. **Start the Application**
```bash
npm run dev
```

3. **Open Web Interface**
```
http://localhost:5000
```

4. **Scan QR Code**
   - Open the web interface
   - Scan the QR code with WhatsApp mobile app
   - Wait for "Connected" status

### Using Docker

1. **Build Image**
```bash
docker build -t whatsapp-bot .
```

2. **Run Container**
```bash
docker run -d \
  -p 5000:5000 \
  -v $(pwd)/whatsapp-data:/app/.wwebjs_auth \
  --name whatsapp-bot \
  whatsapp-bot:latest
```

3. **Access Application**
```
http://localhost:5000
```

## 🔌 API Endpoints

### Send Message
```bash
POST /api/send-message
Content-Type: application/json

{
  "phoneNumber": "918590000953",
  "message": "Hello from WhatsApp Bot!"
}
```

### Check Connection Status
```bash
GET /api/session
```

### Get Contacts
```bash
GET /api/contacts
```

### Get Messages
```bash
GET /api/messages?chatId=918590000953@c.us&limit=50
```

### Disconnect
```bash
POST /api/disconnect
```

## 📱 Phone Number Format

**IMPORTANT**: Always use international format WITHOUT the '+' symbol.

✅ **Correct**:
- `918590000953` (India)
- `447700900000` (UK)
- `12025550123` (USA)

❌ **Wrong**:
- `+918590000953` (has + symbol)
- `8590000953` (missing country code)

## 🐳 Docker Deployment

See **[DOCKER_KOYEB_DEPLOYMENT.md](DOCKER_KOYEB_DEPLOYMENT.md)** for complete instructions on:
- Local Docker deployment
- Docker Compose setup
- Koyeb cloud deployment (3 methods)
- Persistent storage configuration
- Environment variables
- Troubleshooting

## 💻 PHP Integration

See **[PHP_INTEGRATION_GUIDE.md](PHP_INTEGRATION_GUIDE.md)** for:
- Complete WhatsAppAPI PHP class
- Send welcome messages on user registration
- Send order confirmations
- Bulk message sending with rate limiting
- Error handling best practices
- Testing procedures

### Quick PHP Example

```php
<?php
require_once 'WhatsAppAPI.php';

$whatsapp = new WhatsAppAPI('http://localhost:5000');

if ($whatsapp->isReady()) {
    $result = $whatsapp->sendMessage('918590000953', 'Hello from PHP!');
    echo "Message sent!";
} else {
    echo "WhatsApp is not connected";
}
?>
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Web Browser                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Dashboard   │  │   Contacts   │  │   Messages   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└────────────┬────────────────────────────────┬───────────┘
             │                                │
             │ HTTP/WebSocket                 │
             │                                │
┌────────────▼────────────────────────────────▼───────────┐
│              Node.js Express Server                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  REST API    │  │  WebSocket   │  │  WhatsApp    │ │
│  │  Endpoints   │  │    Server    │  │   Service    │ │
│  └──────────────┘  └──────────────┘  └──────┬───────┘ │
└─────────────────────────────────────────────┼───────────┘
                                              │
                                              │ WhatsApp Web.js
                                              │
                                    ┌─────────▼──────────┐
                                    │   WhatsApp Web     │
                                    │  (Chromium/Puppeteer)│
                                    └────────────────────┘
```

## 🔐 Security Considerations

⚠️ **Important Security Notes**:

1. **No Built-in Authentication**: The API has no authentication by default
2. **Network Security Required**: Secure at network/proxy level
3. **Recommended Setup**:
   - Use firewall rules to restrict access
   - Deploy behind reverse proxy with authentication
   - Use VPN or private network for PHP app communication
   - Never expose directly to public internet

4. **Production Setup Example**:
```
Internet → Nginx (with auth) → WhatsApp Bot (private network) ← PHP App
```

## 📊 System Requirements

### Minimum
- Node.js 18+
- 512 MB RAM
- 1 GB disk space

### Recommended
- Node.js 20+
- 1 GB RAM
- 2 GB disk space
- Persistent storage for session data

## 🔧 Configuration

### Environment Variables

```bash
PORT=5000                    # Server port (default: 5000)
NODE_ENV=production         # Environment mode
SESSION_SECRET=your-secret  # Session secret key (required)
```

### Persistent Storage

The following directories must be persisted:
- `.wwebjs_auth/` - WhatsApp session credentials
- `.wwebjs_cache/` - Message cache and temporary data

**Without persistence**, you'll need to scan QR code after every restart.

## 📝 Development Guidelines

### Tech Stack
- **Backend**: Node.js, Express, WhatsApp Web.js
- **Frontend**: React, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui components
- **Storage**: In-memory (MemStorage)
- **Real-time**: Socket.io (WebSocket)

### Project Structure
```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   └── lib/         # Utilities
├── server/              # Express backend
│   ├── routes.ts        # API endpoints
│   ├── whatsapp.ts      # WhatsApp service
│   └── storage.ts       # Data storage
├── shared/              # Shared types
│   └── schema.ts        # Data models
└── Dockerfile           # Docker configuration
```

## 🧪 Testing

### Test WhatsApp Connection
```bash
curl http://localhost:5000/api/session
```

### Test Send Message
```bash
curl -X POST http://localhost:5000/api/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "918590000953",
    "message": "Test message"
  }'
```

### Monitor Logs
```bash
# Docker
docker logs -f whatsapp-bot

# Local
npm run dev  # Logs appear in console
```

## 🚨 Troubleshooting

### QR Code Not Appearing
1. Check server logs for errors
2. Ensure Chromium is installed (Docker handles this)
3. Restart the application
4. Clear `.wwebjs_auth` folder and try again

### Messages Not Sending
1. Verify WhatsApp is connected (`GET /api/session`)
2. Check phone number format (no + symbol)
3. Ensure recipient has WhatsApp
4. Check server logs for errors

### Session Lost After Restart
1. Verify persistent storage is configured
2. Check volume mounts in Docker
3. Ensure `.wwebjs_auth` folder has correct permissions

## 📦 Deployment Checklist

- [ ] Environment variables configured
- [ ] Persistent volumes mounted (`.wwebjs_auth`, `.wwebjs_cache`)
- [ ] Health checks enabled
- [ ] Network security configured (firewall, reverse proxy)
- [ ] Monitoring and alerts set up
- [ ] Backup strategy for session data
- [ ] Documentation shared with team

## 🌐 Live Demo

Once deployed, access:
- **Web Interface**: `https://your-app.koyeb.app`
- **API Base URL**: `https://your-app.koyeb.app/api`
- **Health Check**: `https://your-app.koyeb.app/api/session`

## 📚 Additional Resources

- [WhatsApp Web.js Documentation](https://wwebjs.dev/)
- [Koyeb Documentation](https://www.koyeb.com/docs)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)

## ⚖️ Important Disclaimers

1. **Unofficial API**: This uses WhatsApp Web.js, which is NOT an official WhatsApp API
2. **Terms of Service**: Review WhatsApp's terms before commercial use
3. **Official API**: For business use, consider [WhatsApp Business API](https://business.whatsapp.com/)
4. **Rate Limits**: WhatsApp may restrict accounts sending too many messages
5. **Account Risk**: Use at your own risk; accounts may be banned for violations

## 🤝 Integration Examples

### From PHP Application
See **[PHP_INTEGRATION_GUIDE.md](PHP_INTEGRATION_GUIDE.md)**

### From Python Application
```python
import requests

def send_whatsapp(phone, message):
    response = requests.post('http://localhost:5000/api/send-message', json={
        'phoneNumber': phone,
        'message': message
    })
    return response.json()

# Usage
send_whatsapp('918590000953', 'Hello from Python!')
```

### From cURL
```bash
curl -X POST http://localhost:5000/api/send-message \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"918590000953","message":"Hello!"}'
```

## 📞 Support

For issues, questions, or contributions:
1. Check the documentation files
2. Review troubleshooting section
3. Check server logs for errors
4. Test with curl commands first

## 📄 License

This project uses WhatsApp Web.js. Please review their license and WhatsApp's terms of service.

---

**Ready to deploy?** See **[DOCKER_KOYEB_DEPLOYMENT.md](DOCKER_KOYEB_DEPLOYMENT.md)** to get started!

**Need PHP integration?** See **[PHP_INTEGRATION_GUIDE.md](PHP_INTEGRATION_GUIDE.md)** for complete examples!
