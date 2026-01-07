# Collectiv v0.84 - Local Docker Setup Guide

Run Collectiv locally with Docker Compose for development and testing.

## 📋 Prerequisites

- **Docker**: [Install Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Docker Compose**: Included with Docker Desktop
- **macOS/Linux/Windows**: Works on all platforms

## 🚀 Quick Start

### 1. Clone Repository

```bash
cd /Users/franksimpson/CascadeProjects/collectiv-v0.84
```

### 2. Build and Start Services

```bash
# Build and start all services
docker-compose up -d

# Watch logs in real-time
docker-compose logs -f nextjs
```

### 3. Access Application

- **Web App**: http://localhost:3000
- **API**: http://localhost:3000/api
- **Database** (psql): `postgres://collectiv:collectiv_dev_password@localhost:5432/collectiv`
- **Redis**: `redis://localhost:6379`

## 📦 Services

### PostgreSQL Database
- **Container**: `collectiv-postgres`
- **User**: `collectiv`
- **Password**: `collectiv_dev_password`
- **Database**: `collectiv`
- **Port**: `5432`

### Redis Cache
- **Container**: `collectiv-redis`
- **Port**: `6379`

### Next.js Application
- **Container**: `collectiv-app`
- **Port**: `3000`
- **Environment**: `development`

## 🗄️ Database Setup

### Initialize Database

```bash
# Access the container
docker-compose exec nextjs bash

# Inside container, run migrations
npm run db:push

# Optional: Seed database
npm run db:seed

# Exit container
exit
```

### Connect with psql

```bash
# From your host machine
psql postgresql://collectiv:collectiv_dev_password@localhost:5432/collectiv

# View tables
\dt

# Exit
\q
```

## 🛠️ Common Commands

### Start Services

```bash
# Start in background
docker-compose up -d

# Start and show logs
docker-compose up
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (delete data)
docker-compose down -v
```

### Rebuild After Code Changes

```bash
# Rebuild and restart
docker-compose up -d --build

# Or manually rebuild
docker-compose build
docker-compose up -d
```

### View Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs nextjs
docker-compose logs postgres
docker-compose logs redis

# Follow logs in real-time
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail 100
```

### Access Container Shell

```bash
# Next.js app
docker-compose exec nextjs bash

# PostgreSQL
docker-compose exec postgres psql -U collectiv -d collectiv

# Redis
docker-compose exec redis redis-cli
```

### Check Service Status

```bash
# View running containers
docker-compose ps

# Inspect a service
docker-compose inspect nextjs
```

## 🔍 Debugging

### Check Container Logs

```bash
# See why a service failed to start
docker-compose logs nextjs

# Follow logs continuously
docker-compose logs -f nextjs
```

### Database Connection Issues

```bash
# Test PostgreSQL connection from app container
docker-compose exec nextjs psql postgresql://collectiv:collectiv_dev_password@postgres:5432/collectiv

# Check if postgres is healthy
docker-compose ps | grep postgres
```

### Next.js Build Issues

```bash
# Rebuild without cache
docker-compose build --no-cache nextjs

# Check Node version
docker-compose exec nextjs node --version

# Check npm version
docker-compose exec nextjs npm --version
```

## 📊 Development Workflow

### 1. Start Development Environment

```bash
docker-compose up -d
```

### 2. Watch Application Logs

```bash
docker-compose logs -f nextjs
```

### 3. Edit Code Locally

- Edit files in your IDE
- Changes automatically sync to container (volumes mount)
- Next.js dev server will hot-reload

### 4. Check Database

```bash
# Access database shell
docker-compose exec postgres psql -U collectiv -d collectiv

# Run SQL queries
SELECT * FROM "Article";
```

### 5. Stop When Done

```bash
docker-compose down
```

## 🔐 Environment Variables

All environment variables are configured in `docker-compose.yml`:

- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_SITE_URL`: Local development URL
- `NODE_ENV`: Set to `development` for hot-reload
- `REDIS_URL`: Redis connection string
- `PORT`: Application port

**To modify**: Edit `docker-compose.yml` and run `docker-compose up -d --build`

## 📈 Performance Tips

### 1. Use Named Volumes

```bash
# Volumes are persistent across restarts
docker-compose down
docker-compose up -d
# Data persists!
```

### 2. Reduce Build Time

```bash
# Use cache
docker-compose up -d

# Avoid rebuild if possible
docker-compose ps  # Check status without rebuilding
```

### 3. Monitor Resource Usage

```bash
# macOS/Linux
docker stats

# Windows
docker stats --all
```

## 🧹 Cleanup

### Remove All Containers

```bash
# Stop and remove
docker-compose down

# Remove volumes (delete data)
docker-compose down -v
```

### Clean Docker System

```bash
# Remove unused images and containers
docker system prune

# Remove all unused data
docker system prune -a
```

## 📚 Useful Docker Compose Commands

```bash
# Validate compose file
docker-compose config

# Show running processes
docker-compose top

# Restart services
docker-compose restart

# Restart specific service
docker-compose restart nextjs

# Pull latest images
docker-compose pull
```

## 🚨 Troubleshooting

### Port Already in Use

```bash
# If port 3000 is in use
# Option 1: Stop conflicting service
lsof -i :3000
kill -9 <PID>

# Option 2: Change port in docker-compose.yml
ports:
  - "3001:3000"  # Map to 3001 instead
```

### Out of Disk Space

```bash
# Clean up Docker
docker system prune -a --volumes

# Rebuild
docker-compose up -d --build
```

### Container Won't Start

```bash
# Check logs
docker-compose logs nextjs

# Restart service
docker-compose restart nextjs

# Rebuild
docker-compose build --no-cache nextjs
docker-compose up -d
```

### Database Connection Error

```bash
# Verify PostgreSQL is running
docker-compose ps

# Check connection string
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

## 📞 Getting Help

1. Check logs: `docker-compose logs -f`
2. Verify services: `docker-compose ps`
3. Test connectivity: `docker-compose exec nextjs curl postgres:5432`
4. Review [Docker documentation](https://docs.docker.com/)

## ✨ Next Steps

1. ✅ Start with `docker-compose up -d`
2. ✅ Visit http://localhost:3000
3. ✅ Initialize database with `npm run db:push`
4. ✅ Start developing!
5. ✅ Push changes to GitHub

---

**Happy local development!** 🎉
