# TaskFlow AI - Full Stack Deployment Guide to Render

## 📋 Prerequisites Checklist

- [ ] GitHub account with taskflow-ai repo pushed
- [ ] Render account (https://render.com)
- [ ] PostgreSQL instance (local or cloud)
- [ ] Grok API credentials
- [ ] Google Calendar API credentials (if using)
- [ ] Node.js 18+ and Java 17+ installed locally

---

## Part 1: Environment Variables Setup

### 1.1 Backend Environment Variables (.env)

Create a `.env` file in your `backend/` directory:

```env
# Database Configuration
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/taskflow_db
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your_postgres_password
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_JPA_SHOW_SQL=false
SPRING_JPA_PROPERTIES_HIBERNATE_DIALECT=org.hibernate.dialect.PostgreSQL10Dialect

# Server Configuration
SERVER_PORT=8080
SPRING_APPLICATION_NAME=taskflow-api

# API Keys & External Services
GROK_API_KEY=your_grok_api_key_here
GROK_API_BASE_URL=https://api.x.ai/v1

# Google Calendar Integration (if using)
GOOGLE_CALENDAR_CLIENT_ID=your_google_client_id
GOOGLE_CALENDAR_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:8080/auth/google/callback

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://your-frontend-domain.onrender.com

# JWT & Security
JWT_SECRET=your_secure_jwt_secret_key_min_32_chars
JWT_EXPIRATION_MS=86400000

# Environment
SPRING_PROFILES_ACTIVE=dev
```

### 1.2 Frontend Environment Variables (.env.local)

Create a `.env.local` file in your `frontend/` directory:

```env
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_CALENDAR_SYNC=true
VITE_ENABLE_GROK_AI=true

# Google OAuth (if using)
VITE_GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
```

### 1.3 Create `.env.production` for Frontend

```env
VITE_API_BASE_URL=https://your-backend-domain.onrender.com/api
VITE_API_TIMEOUT=30000
VITE_ENABLE_CALENDAR_SYNC=true
VITE_ENABLE_GROK_AI=true
```

**⚠️ IMPORTANT:** Add `.env`, `.env.local`, `.env.*.local` to `.gitignore`:

```gitignore
# Environment Variables
.env
.env.local
.env.*.local
.env.production.local
.env.development.local

# Secrets
*.pem
*.key
secret*.txt
```

---

## Part 2: Backend Setup (Spring Boot)

### 2.1 Verify `pom.xml` Dependencies

Ensure these are in your `backend/pom.xml`:

```xml
<dependencies>
    <!-- Spring Boot Starters -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <!-- PostgreSQL Driver -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
    
    <!-- Lombok (for boilerplate reduction) -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
    
    <!-- JWT/Security -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.3</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.12.3</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.12.3</version>
        <scope>runtime</scope>
    </dependency>
    
    <!-- Testing -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### 2.2 Create `application.yml` or `application.properties`

**backend/src/main/resources/application.yml:**

```yaml
spring:
  application:
    name: taskflow-api
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQL10Dialect
        format_sql: true
  
  datasource:
    url: ${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/taskflow_db}
    username: ${SPRING_DATASOURCE_USERNAME:postgres}
    password: ${SPRING_DATASOURCE_PASSWORD}
    driver-class-name: org.postgresql.Driver
  
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB

server:
  port: ${SERVER_PORT:8080}
  servlet:
    context-path: /api

app:
  jwt:
    secret: ${JWT_SECRET}
    expirationMs: ${JWT_EXPIRATION_MS:86400000}

cors:
  allowedOrigins: ${CORS_ALLOWED_ORIGINS:http://localhost:3000,http://localhost:5173}

grok:
  api:
    key: ${GROK_API_KEY}
    baseUrl: ${GROK_API_BASE_URL:https://api.x.ai/v1}
```

### 2.3 Docker Setup for Backend

Create `backend/Dockerfile`:

```dockerfile
# Build Stage
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline

COPY src/ src/
RUN mvn clean package -DskipTests

# Runtime Stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

ENV JAVA_OPTS="-Xmx512m -Xms256m"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

Create `backend/.dockerignore`:

```
.git
.gitignore
.mvn
.env
.env.local
*.md
target/
```

### 2.4 Local Testing

```bash
cd backend

# Set environment variables
export SPRING_DATASOURCE_PASSWORD=your_password
export JWT_SECRET=your_super_secret_key_at_least_32_chars
export GROK_API_KEY=your_grok_key

# Build
mvn clean package

# Run
java -jar target/taskflow-api-0.0.1-SNAPSHOT.jar
```

---

## Part 3: Frontend Setup (React + Vite)

### 3.1 Frontend Build Configuration

**frontend/vite.config.ts** (or .js if using plain config):

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@dnd-kit/core', '@dnd-kit/utilities']
        }
      }
    }
  }
})
```

### 3.2 Create API Service with Environment Variables

**frontend/src/services/api.ts:**

```typescript
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 30000

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: parseInt(API_TIMEOUT),
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
```

### 3.3 Docker Setup for Frontend

Create `frontend/Dockerfile`:

```dockerfile
# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime Stage
FROM node:18-alpine

WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
```

Create `frontend/.dockerignore`:

```
node_modules
.env.local
.env.*.local
dist
.git
.gitignore
*.md
```

### 3.4 Update `package.json` Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "axios": "^1.6.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/utilities": "^3.2.1",
    "tailwindcss": "^4.0.0"
  },
  "devDependencies": {
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.7.0"
  }
}
```

---

## Part 4: PostgreSQL Setup

### 4.1 Local PostgreSQL Setup

```bash
# Create database
createdb taskflow_db

# Connect and verify
psql -U postgres -d taskflow_db
```

### 4.2 For Production (Render PostgreSQL)

You'll configure this in Render's dashboard. For now, keep using local.

---

## Part 5: Docker Compose for Local Testing

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: taskflow_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/taskflow_db
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: postgres
      JWT_SECRET: local_jwt_secret_at_least_32_characters
      GROK_API_KEY: ${GROK_API_KEY}
      CORS_ALLOWED_ORIGINS: http://localhost:3000,http://localhost:5173
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./backend:/app

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      VITE_API_BASE_URL: http://localhost:8080/api
    depends_on:
      - backend

volumes:
  postgres_data:
```

**Test locally:**

```bash
docker-compose up --build
# Frontend: http://localhost:3000
# Backend: http://localhost:8080/api
# Postgres: localhost:5432
```

---

## Part 6: Render Deployment Setup

### 6.1 Push to GitHub

```bash
git add .
git commit -m "Add deployment configs: Dockerfile, docker-compose, env templates"
git push origin main
```

### 6.2 Create Backend Service on Render

1. **Go to Render Dashboard** → New → Web Service
2. **Connect Repository:** Select `taskflow-ai`
3. **Configure:**
   - **Name:** `taskflow-api`
   - **Region:** Singapore or closest to you
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Docker
   - **Build Command:** (leave empty - uses Dockerfile)
   - **Start Command:** (leave empty - uses Dockerfile)
   - **Plan:** Free or Starter

4. **Environment Variables** → Add:
   ```
   SPRING_DATASOURCE_URL=postgresql://postgres_user:password@render-postgres-host:5432/taskflow_db
   SPRING_DATASOURCE_USERNAME=postgres
   SPRING_DATASOURCE_PASSWORD=your_secure_password
   JWT_SECRET=your_32plus_char_secret_key
   GROK_API_KEY=your_grok_api_key
   CORS_ALLOWED_ORIGINS=https://taskflow-ai-frontend.onrender.com
   SPRING_PROFILES_ACTIVE=prod
   ```

5. **Deploy!**

### 6.3 Create PostgreSQL on Render

1. **Render Dashboard** → New → PostgreSQL
2. **Configure:**
   - **Name:** `taskflow-db`
   - **Database:** `taskflow_db`
   - **User:** `postgres`
   - **Region:** Same as backend
   - **Plan:** Free tier

3. **Copy connection string** and use in backend env vars

### 6.4 Create Frontend Service on Render

1. **New → Static Site**
2. **Connect Repository:** `taskflow-ai`
3. **Configure:**
   - **Name:** `taskflow-ai-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

4. **Environment Variables:**
   ```
   VITE_API_BASE_URL=https://taskflow-api.onrender.com/api
   ```

5. **Deploy!**

### 6.5 Update CORS in Backend

After frontend is deployed, update backend env var:
```
CORS_ALLOWED_ORIGINS=https://taskflow-ai-frontend.onrender.com,http://localhost:3000
```

---

## Part 7: Pre-Deployment Checklist

### Backend (`backend/` directory)

- [ ] `pom.xml` has all required dependencies
- [ ] `Dockerfile` is in backend root
- [ ] `.dockerignore` is created
- [ ] `application.yml` uses environment variables
- [ ] `@CrossOrigin` or CORS config handles frontend domain
- [ ] Health check endpoint exists (e.g., `/api/health`)
- [ ] No hardcoded secrets in code

### Frontend (`frontend/` directory)

- [ ] `Dockerfile` is in frontend root
- [ ] `.dockerignore` is created
- [ ] `vite.config.ts` configured
- [ ] `.env.local` and `.env` in `.gitignore`
- [ ] API service uses `VITE_API_BASE_URL`
- [ ] JWT token stored/retrieved from localStorage
- [ ] Production build tested locally: `npm run build && npm run preview`

### Root Directory

- [ ] `docker-compose.yml` for local testing
- [ ] `.gitignore` excludes `.env*` files
- [ ] `README.md` updated with deployment instructions
- [ ] GitHub repo is public (if using free Render)

---

## Part 8: Common Issues & Fixes

### Issue: CORS Error on Frontend

**Symptom:** Frontend can't reach backend

**Fix:** Update backend CORS:
```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(
            Arrays.asList(System.getenv("CORS_ALLOWED_ORIGINS").split(","))
        );
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### Issue: Database Connection Fails on Render

**Symptom:** `Connection refused` error

**Fix:** 
- Verify PostgreSQL service is deployed and running
- Check connection string format: `postgresql://user:password@host:5432/dbname`
- Ensure backend can reach database (same Render account)

### Issue: Frontend Can't Find Backend API

**Symptom:** `404` or `ERR_INVALID_PROTOCOL`

**Fix:**
- Verify `VITE_API_BASE_URL` includes full domain: `https://your-backend.onrender.com/api`
- Not: `http://` (must be `https://` for production)
- Rebuild frontend after env change

### Issue: JWT Token Expiration Issues

**Symptom:** Users logged out after 24 hours

**Fix:** Implement refresh token mechanism or increase `JWT_EXPIRATION_MS`

---

## Part 9: Monitoring & Logs

### View Render Logs

```bash
# Using Render CLI (optional)
render logs taskflow-api --follow
```

Or via Dashboard:
- Select service → Logs tab → Real-time stream

### Health Check Endpoint

Add to backend:

```java
@RestController
@RequestMapping("/api")
public class HealthController {
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(
            Map.of("status", "UP", "timestamp", LocalDateTime.now().toString())
        );
    }
}
```

Test: `curl https://taskflow-api.onrender.com/api/health`

---

## Part 10: Post-Deployment Steps

1. **Test all endpoints** via Postman/REST Client
2. **Enable auto-deployment** (Render defaults to this)
3. **Set up monitoring alerts** if using paid plan
4. **Document API endpoints** (use Swagger/SpringDoc if added)
5. **Backup database regularly** (Render provides backups)
6. **Monitor free tier limits** (512MB RAM, cold starts)

---

## Quick Reference: Commands

```bash
# Local development
docker-compose up

# Build backend locally
cd backend && mvn clean package

# Build frontend locally
cd frontend && npm run build

# Test frontend build
cd frontend && npm run preview

# Push to Render
git add . && git commit -m "message" && git push origin main

# Check status
# → Visit Render Dashboard
```

---

## Next Steps

1. ✅ Copy `.env` template and fill in your secrets
2. ✅ Update Dockerfiles with your project paths
3. ✅ Test locally with `docker-compose up`
4. ✅ Push to GitHub
5. ✅ Deploy backend to Render
6. ✅ Deploy database to Render
7. ✅ Deploy frontend to Render
8. ✅ Test all integrations (Grok API, Calendar Sync, etc.)

---

## Support Resources

- **Render Docs:** https://render.com/docs
- **Spring Boot Docs:** https://spring.io/projects/spring-boot
- **React + Vite:** https://vitejs.dev/guide/
- **PostgreSQL on Render:** https://render.com/docs/databases