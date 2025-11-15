# Lightweight Dockerfile for Baileys WhatsApp Bot
# Optimized for low-memory environments (512MB RAM) - Koyeb free tier

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install minimal required packages
RUN apk add --no-cache curl

ENV NODE_ENV=production
ENV PORT=5000

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Create session directories for Baileys auth
RUN mkdir -p .sessions/baileys && chmod -R 777 .sessions

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000/api/session || exit 1

# Start the application
CMD ["node", "dist/index.js"]
