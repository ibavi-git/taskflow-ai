# ============================================
# TaskFlow AI - Frontend Dockerfile
# ============================================
# Place this file in: frontend/Dockerfile

# Stage 1: Build Application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (use ci for consistent installs)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ============================================
# Stage 2: Runtime Image
FROM node:22-alpine

WORKDIR /app

# Install serve to run the static build
RUN npm install -g serve

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Expose port
EXPOSE 3000

# Environment variables (can be overridden during docker run)
ENV NODE_ENV=production

# Serve the built application
CMD ["serve", "-s", "dist", "-l", "3000"]
