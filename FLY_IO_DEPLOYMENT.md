# Collectiv v0.84 - Fly.io Deployment Guide

## Overview
Deploy Collectiv to **Fly.io** - a modern platform for running full-stack applications with integrated PostgreSQL and Redis support.

## Prerequisites
- Fly.io account (https://fly.io)
- `flyctl` installed (`brew install flyctl` ✅)
- Logged into Fly: `flyctl auth login`

## Quick Start

### 1. First-Time Deployment

```bash
cd /Users/franksimpson/CascadeProjects/collectiv-v0.84

# Generate Fly.io configuration and provision resources
flyctl launch

# This will:
# - Create a Fly.io app
# - Ask about regions (choose close to your users)
# - Provision PostgreSQL database
# - Provision Redis cache
```

### 2. Configure Environment Variables

```bash
# Set your database URL (Fly.io provides this automatically)
flyctl secrets set DATABASE_URL="postgresql://..."

# Set Redis URL (Fly.io provides this automatically)
flyctl secrets set REDIS_URL="redis://..."

# Other variables
flyctl secrets set NODE_ENV="production"
```

### 3. Deploy

```bash
# Deploy to Fly.io
flyctl deploy

# Monitor deployment
flyctl status

# View logs in real-time
flyctl logs
```

## Architecture on Fly.io

```
Collectiv v0.84 (Fly.io App)
├── Next.js 15 + TypeScript
├── PostgreSQL 16 (Fly.io Postgres)
├── Redis 7 (Fly.io Redis)
└── Automatic SSL/TLS via Fly.io
```

## Connecting to Services

### PostgreSQL

```bash
# Connect to Postgres database
flyctl postgres connect

# Run migrations
flyctl ssh console
npm run db:push
```

### Redis

```bash
# Check Redis is running
flyctl redis status

# Connect to Redis console
flyctl redis connect
```

## Scaling

### Vertical Scaling (Machine resources)

```bash
# Check current machine
flyctl machines list

# Increase memory
flyctl scale memory 1024

# Increase CPU
flyctl scale count 2   # More instances running
```

### Horizontal Scaling (Multiple instances)

```bash
# Currently set to min 1 machine
# Edit fly.toml to increase:

# In fly.toml:
# auto_start_machines = true
# min_machines_running = 3   # Run 3 instances

flyctl deploy
```

## Managing Your App

### View dashboards
```bash
# Open in browser
flyctl open
```

### Check health
```bash
flyctl status
flyctl machines status
```

### View logs
```bash
# All logs
flyctl logs

# Follow logs in real-time
flyctl logs -f

# By machine
flyctl logs -m <machine-id>
```

### SSH into your app
```bash
# Get console access
flyctl ssh console

# Run commands
flyctl ssh console -C "npm run db:studio"
```

## Environment Setup

### Database Initialization
Fly.io automatically provisions PostgreSQL. The app runs this on deploy:
```bash
npm run db:push
```

### Redis Integration
Fly.io automatically manages Redis connection. Available at `$REDIS_URL`.

## Production Checklist

- [ ] Database credentials secured in Fly secrets
- [ ] Redis connection string in secrets
- [ ] `NODE_ENV=production` set
- [ ] Database migrations tested: `fly ssh console -C "npm run db:push"`
- [ ] Logs checked: `fly logs`
- [ ] Custom domain configured (optional)
- [ ] Monitoring/alerts set up

## Custom Domain (Optional)

```bash
# Add your domain
flyctl certs add your-domain.com

# Update DNS records (instructions provided)
# Wait for Let's Encrypt certificate

# Verify
flyctl certs list
```

## Troubleshooting

### App won't start
```bash
# Check logs
flyctl logs

# SSH and check process
flyctl ssh console
ps aux | grep node
```

### Database connection error
```bash
# Verify DATABASE_URL is set
flyctl secrets list

# Test connection
flyctl ssh console -C "psql $DATABASE_URL"
```

### Redis error
```bash
# Check Redis is running
flyctl redis status

# Test connection
flyctl ssh console -C "redis-cli -u $REDIS_URL"
```

### Out of memory
```bash
# Check current usage
flyctl machines list

# Increase machine memory
flyctl scale memory 1024
```

## Monitoring & Observability

### Built-in Metrics
- CPU usage
- Memory usage
- Request count
- Error rates

View at: https://fly.io/dashboard

### Custom Monitoring
Add APM/monitoring service of choice via environment variables.

## Cost Optimization

- **Free tier**: 3 shared-cpu VMs (0.25 CPU each)
- **Paid**: $0.015/hour per shared CPU instance
- **Database**: Managed PostgreSQL pricing
- **Redis**: Managed Redis pricing

### Tips
- Use `min_machines_running = 1` for lower traffic
- Scale up during peak hours
- Monitor memory usage (512MB VM recommended minimum)

## Deployment Workflow

1. **Development**: Test locally with Docker Compose
   ```bash
   docker-compose up
   ```

2. **Staging**: Deploy to Fly.io for testing
   ```bash
   flyctl deploy
   ```

3. **Production**: Same Fly.io app (or create separate app for prod)
   ```bash
   flyctl deploy  # Main app
   ```

## Rollback

```bash
# View recent deployments
flyctl releases

# Rollback to previous version
flyctl releases rollback

# Deploy specific version
flyctl deploy --image-label <version>
```

## Useful Commands

```bash
# Check app status
flyctl status

# Update app
flyctl deploy

# Monitor in real-time
flyctl logs -f

# SSH into machine
flyctl ssh console

# Database operations
flyctl ssh console -C "npm run db:studio"
flyctl ssh console -C "npm run db:push"

# Restart app
flyctl restart

# View configuration
flyctl config show

# Scale resources
flyctl scale memory 1024
flyctl scale count 3

# Manage secrets
flyctl secrets list
flyctl secrets set KEY=value
flyctl secrets unset KEY

# Delete app
flyctl destroy collectiv-v084
```

## Support & Resources

- **Fly.io Docs**: https://fly.io/docs/
- **Getting Help**: `flyctl help`
- **Status Page**: https://status.fly.io

---

**Version**: v0.84.0 (January 7, 2026)
**Last Updated**: Fly.io deployment configured with flyctl 0.4.1
