# Fly.io Deployment Troubleshooting Guide

## Current Issue: Release Command Failure

The Docker image builds successfully and is pushed to Fly.io, but the release command fails because `DATABASE_URL` is not available during the Prisma migration.

### Error Details
```
Error: Prisma schema validation - (get-config wasm)
Error code: P1012
error: Environment variable not found: DATABASE_URL.
```

## Solutions

### Option 1: Skip Database Migration (Temporary)
If you don't have a database configured yet, disable the release command:

**Edit fly.toml:**
```toml
[deploy]
  # Temporarily remove or comment out this line
  # release_command = "npm run db:push || true"
  strategy = "rolling"
```

Then redeploy:
```bash
flyctl deploy -a collectiv
```

### Option 2: Use Supabase (Recommended)
Follow the **SUPABASE_INTEGRATION_GUIDE.md** for full setup:

1. Create a Supabase project
2. Get your PostgreSQL connection string
3. Set it as a Fly.io secret:
```bash
flyctl secrets set DATABASE_URL="postgresql://user:password@host:5432/collectiv?schema=public" -a collectiv
```

4. Redeploy:
```bash
flyctl deploy -a collectiv
```

### Option 3: Configure Fly.io PostgreSQL (Advanced)
If you want to use Fly.io's managed Postgres:

```bash
# This requires interactive setup in the Fly dashboard or CLI
# The old `flyctl postgres create` command is deprecated in favor of interactive setup
```

For now, **Supabase is the recommended path** as documented in SUPABASE_INTEGRATION_GUIDE.md.

### Option 4: Disable Release Command Entirely
If you want to deploy without database operations:

**Edit fly.toml:**
```toml
[deploy]
  # Remove or comment out the release_command
  strategy = "rolling"
```

Then the app will deploy without running database migrations on release.

## Verifying Deployment

Once deployed, check status with:
```bash
# Check app status
flyctl status -a collectiv

# View recent logs
flyctl logs -a collectiv

# SSH into the running machine
flyctl ssh console -a collectiv
```

## Testing the Application

After deployment, test the endpoints:

```bash
# Get app URL
flyctl info -a collectiv

# Test root endpoint
curl https://collectiv.fly.dev

# Test API endpoints
curl https://collectiv.fly.dev/api/search?q=test
curl https://collectiv.fly.dev/api/curator/wiki-context
```

## Recommended Next Steps

1. **Set up Supabase** (see SUPABASE_INTEGRATION_GUIDE.md):
   - Create Supabase project
   - Get PostgreSQL connection string
   - Set DATABASE_URL secret on Fly.io
   - Redeploy with release command enabled

2. **Or temporarily disable** the release command:
   - Comment out `release_command` in fly.toml
   - Redeploy to get app running
   - Set up database later

3. **Monitor the deployment**:
   - Check `flyctl logs -a collectiv` for errors
   - Use `flyctl status -a collectiv` to verify running machines

## Quick Reference: Setting Secrets

```bash
# Set DATABASE_URL (replace with your actual connection string)
flyctl secrets set DATABASE_URL="postgresql://user:pass@host/db" -a collectiv

# View all secrets (doesn't show values)
flyctl secrets list -a collectiv

# Delete a secret
flyctl secrets unset DATABASE_URL -a collectiv

# Redeploy to apply new secrets
flyctl deploy -a collectiv
```

## Performance Optimization Tips

1. **Scale down VM** if needed:
   ```bash
   flyctl scale vm shared-cpu-2x --count 1 -a collectiv
   ```

2. **Enable autoscaling**:
   ```bash
   flyctl autoscale set --min 1 --max 3 -a collectiv
   ```

3. **Monitor metrics**:
   ```bash
   flyctl status -a collectiv
   ```

## Common Issues

### Issue: App Keeps Restarting
- Check logs: `flyctl logs -a collectiv`
- Likely causes: Missing environment variables, database connection issues
- Solution: Set required secrets and variables

### Issue: 502 Bad Gateway
- App is crashing or not responding
- Check: `flyctl logs -a collectiv` for startup errors
- Verify: All environment variables are set

### Issue: High Memory Usage
- App might be leaking resources
- Check: Node.js memory settings
- Solution: Reduce VM size or optimize code

## Deployment Command Reference

```bash
# Deploy with specific flags
flyctl deploy -a collectiv --detach  # Don't wait for completion

# View deployment status
flyctl status -a collectiv

# View recent deployments
flyctl deployments list -a collectiv

# Rollback to previous version
flyctl releases -a collectiv  # Show releases
flyctl releases rollback -a collectiv  # Rollback to last stable

# Force rebuild (clear cache)
flyctl deploy --build-only -a collectiv
```

## Next: Supabase Integration

Once you have the app deployed, follow **SUPABASE_INTEGRATION_GUIDE.md** to:
- Set up members-only access
- Configure OAuth with Custom GPT
- Handle Stripe subscriptions
- Implement Row Level Security
