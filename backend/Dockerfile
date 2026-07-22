# ============================================
# TaskFlow AI - Backend Dockerfile
# ============================================

# Stage 1: Build Application
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src/ src/

RUN mvn clean package -DskipTests

# ============================================
# Stage 2: Runtime Image
FROM eclipse-temurin:21-jre-alpine

# Run as non-root user for production security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Ensure correct permissions on the jar file
COPY --chown=appuser:appgroup --from=builder /app/target/*.jar app.jar

# Switch to non-root user
USER appuser

# Health check (matches endpoint in HealthController.java)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/healthz || exit 1

ENV JAVA_OPTS="-Xmx512m -Xms256m"

EXPOSE 8080

ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar app.jar"]