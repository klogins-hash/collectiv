# Collectiv v0.84 - Railway Deployment Guide

Deploy Collectiv to Railway with a single click or using the CLI.

## 🚀 Quick Start - One-Click Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new?templateId=collectiv)

## 📋 Prerequisites

- Railway account (free tier available)
- GitHub repository with this code
- PostgreSQL (provided by Railway)

## 🛠️ Manual Deployment

### Option 1: Deploy from GitHub (Recommended)

1. **Create Railway project:**
   ```bash
   railway login
   railway init
   ```

2. **Link GitHub repository:**
   - Go to Railway dashboard
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Authorize and select this repository

3. **Configure environment variables:**
   - Go to Variables tab
   - Add all variables from `.env.example`
   - Set `NODE_ENV=production`
   - Configure `DATABASE_URL` with Railway PostgreSQL

4. **Deploy:**
   - Click "Deploy"
   - Railway automatically detects Next.js and builds

### Option 2: Deploy using Railway CLI

```bash
# Login to Railway
railway login

# Initialize project
railway init

# Set up PostgreSQL database
railway add -s postgres

# Configure environment
railway variable set NODE_ENV production
railway variable set NEXT_PUBLIC_SITE_URL https://<your-domain>.railway.app

# Deploy
railway up
```

### Option 3: Docker Build

```bash
# Push code, Railway automatically builds from Dockerfile
git push origin master
```

## 🗄️ Database Setup

### Connect PostgreSQL

1. Add PostgreSQL plugin to Railway project
2. Copy `DATABASE_URL` from PostgreSQL service
3. Set as environment variable in Next.js service
4. Railway automatically runs migrations on deploy

### Run Prisma Migrations

```bash
# From Railway shell
npm run db:push
npm run db:seed
```

## 🔐 Environment Variables

### Required
```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SITE_URL=https://collectiv.xyz
NODE_ENV=production
PORT=3000
```

### Optional
```env
# SEO & Analytics
NEXT_PUBLIC_SITE_NAME=Collectiv
GOOGLE_ANALYTICS_ID=...

# Search
SEARCH_LIMIT=10
CACHE_TTL=3600

# Security
JWT_SECRET=<generate-strong-secret>
API_KEY_SECRET=<generate-strong-secret>
```

## 📊 Performance Optimization

### Railway Best Practices

1. **Memory & CPU:** Start with Railway's default allocation, scale based on metrics
2. **Build Optimization:** Multi-stage Dockerfile reduces image size
3. **Caching:** Set cache headers via Next.js config
4. **Database Connection Pooling:** Enable in Prisma

### Application Optimizations

- ✅ Image optimization enabled (Next.js Image component)
- ✅ Server-side rendering for SEO
- ✅ Static asset caching
- ✅ API response caching

## 🔍 Monitoring

### Railway Dashboard Insights

- View deployment logs
- Monitor CPU/Memory usage
- Track network I/O
- Check build history

### Health Checks

Railway automatically health checks your service at `http://localhost:3000`

## 🚨 Troubleshooting

### Build Fails

**Error: `npm ci` fails**
- Solution: Ensure `package-lock.json` is committed
- Check Node version compatibility (requires 18+)

**Error: Out of memory during build**
- Solution: Upgrade Railway plan for more build memory
- Use production dependencies only: `npm ci --only=production`

### Runtime Errors

**Error: Database connection refused**
- Check `DATABASE_URL` is set correctly
- Verify PostgreSQL service is running
- Check network connectivity

**Error: Port already in use**
- Railway sets `$PORT` environment variable
- Next.js uses it automatically via `npm start`

## 📈 Scaling

### Vertical Scaling
- Increase Railway plan (more CPU/RAM)

### Horizontal Scaling
- Add replicas in deployment settings
- Use Railway's load balancer

## 📚 Useful Railways Features

- **Volumes:** For persistent data (not needed for stateless Next.js)
- **Webhooks:** Deploy on GitHub push automatically
- **Custom domains:** Connect your domain
- **SSL:** Automatic HTTPS with Railway
- **Environment promotion:** Dev → Staging → Production

## 🔗 Useful Links

- [Railway Documentation](https://docs.railway.app)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Prisma Railway Guide](https://www.prisma.io/docs/reference/database-reference/supported-databases)

## 📞 Support

- Railway support: https://railway.app/support
- Collectiv issues: Check GitHub repository
- Docs: See README.md

## ✨ Next Steps After Deployment

1. Set up custom domain
2. Enable automated backups
3. Configure monitoring alerts
4. Set up CI/CD for automatic deployments
5. Enable database backups

---

**Deploy Collectiv v0.84 today and bring your AI-optimized encyclopedia to the world!** 🌍
