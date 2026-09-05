# CUTI Development Environment - Quick Start

## Current Setup Status

✅ **Completed:**
- Project structure analyzed
- Environment files created with secure JWT secret
- `.env` files configured for API and root
- Prisma schema verified (9 models, PostgreSQL ready)

⚠️ **Action Required:**
- Start PostgreSQL database
- Run Prisma migrations
- Test API server

---

## Quick Start (Recommended: Docker)

### 1. Start Docker Desktop
Docker is installed but not currently running.

**Action:** Launch Docker Desktop from Start Menu or run:
```powershell
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

Wait 30-60 seconds for Docker to fully start.

### 2. Start PostgreSQL Database
```powershell
# Start PostgreSQL container
docker run --name cuti-postgres `
  -e POSTGRES_PASSWORD=password `
  -e POSTGRES_DB=cuti_dev `
  -p 5432:5432 `
  -d postgres:16-alpine

# Verify it's running
docker ps

# Test connection
docker exec -it cuti-postgres psql -U postgres -d cuti_dev -c "SELECT version();"
```

### 3. Install Dependencies & Run Migrations
```powershell
cd D:\cuti

# Install dependencies (if not already done)
pnpm install

# Run Prisma migrations
cd packages\db
pnpm db:migrate dev --name init
pnpm db:generate
```

### 4. Start API Server
```powershell
cd D:\cuti
pnpm --filter @cuti/api dev
```

Expected: `Application is running on: http://localhost:3001`

### 5. Test Auth Endpoints
```powershell
# Register a user
curl -X POST http://localhost:3001/v1/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"Test123456\",\"name\":\"Test User\"}'

# Login
curl -X POST http://localhost:3001/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"Test123456\"}'
```

---

## Alternative: Install PostgreSQL Natively

If you prefer not to use Docker:

### Issue Found
Your PostgreSQL 16 installation at `C:\Program Files\PostgreSQL\16` is incomplete (missing `bin` directory).

### Solution: Reinstall PostgreSQL

1. **Download:** https://www.postgresql.org/download/windows/
   - Get the latest PostgreSQL 16 installer

2. **Install with these settings:**
   - Password: `password` (or update `.env` files)
   - Port: 5432
   - Components: Include "Command Line Tools"

3. **Create Database:**
   ```powershell
   # Add to PATH
   $env:PATH += ";C:\Program Files\PostgreSQL\16\bin"
   
   # Create database
   psql -U postgres -c "CREATE DATABASE cuti_dev;"
   ```

4. **Continue from Step 3 above** (migrations)

---

## Environment Files Created

### D:\cuti\.env
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/cuti_dev"
```

### D:\cuti\apps\api\.env
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/cuti_dev"
JWT_SECRET="your-jwt-secret-key-at-least-32-chars-long"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development

# Google OAuth (optional - update when needed)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

CORS_ORIGINS="http://localhost:3000,http://localhost:3002"
```

### D:\cuti\apps\api\.env.example
Template file for team members (without secrets).

---

## Database Schema Overview

The Prisma schema includes:
- **User** - Authentication, profiles, gamification (coins, XP, levels)
- **CV** - Resume data with ATS scoring
- **Template** - CV templates (ATS, executive, creative, etc.)
- **AIScreening** - AI-powered CV analysis
- **JobApplication** - Application tracking
- **Membership** - Premium subscriptions
- **Payment** - Midtrans payment integration

---

## Troubleshooting

### PostgreSQL Connection Failed
```powershell
# Check if container is running
docker ps

# Check container logs
docker logs cuti-postgres

# Restart container if needed
docker restart cuti-postgres
```

### Port 5432 Already in Use
```powershell
# Find what's using port 5432
netstat -ano | Select-String ":5432"

# Stop existing PostgreSQL service if any
Get-Service | Where-Object { $_.DisplayName -like '*PostgreSQL*' } | Stop-Service
```

### Port 3001 Already in Use
```powershell
# Find process
netstat -ano | Select-String ":3001"

# Kill process (replace <PID>)
Stop-Process -Id <PID> -Force
```

### Prisma Migration Errors
```powershell
# Check database connection
docker exec -it cuti-postgres psql -U postgres -d cuti_dev

# Inside psql:
\l          # List databases
\q          # Quit

# If needed, reset database
cd D:\cuti\packages\db
pnpm db:push --force-reset
```

---

## Next Steps

After successful setup:

1. **Start other applications:**
   ```powershell
   # User dashboard
   pnpm --filter @cuti/user dev    # Port 3000
   
   # Admin dashboard  
   pnpm --filter @cuti/admin dev   # Port 3002
   ```

2. **Explore database with Prisma Studio:**
   ```powershell
   cd packages\db
   pnpm db:studio                  # Opens http://localhost:5555
   ```

3. **Seed template data:**
   ```powershell
   cd packages\db
   pnpm db:seed:templates
   ```

---

## Useful Commands

```powershell
# Start all apps in development
pnpm dev

# Run linting
pnpm lint

# Build all apps
pnpm build

# Clean and reinstall
pnpm clean
pnpm install

# Database commands
cd packages\db
pnpm db:generate              # Generate Prisma Client
pnpm db:migrate dev           # Create migration
pnpm db:push                  # Push schema without migration
pnpm db:studio                # Open Prisma Studio
```

---

## Docker Commands Reference

```powershell
# Container management
docker ps                              # List running containers
docker ps -a                           # List all containers
docker start cuti-postgres             # Start container
docker stop cuti-postgres              # Stop container
docker restart cuti-postgres           # Restart container
docker logs cuti-postgres              # View logs
docker logs -f cuti-postgres           # Follow logs

# Database access
docker exec -it cuti-postgres psql -U postgres -d cuti_dev

# Remove container (if you need to recreate)
docker stop cuti-postgres
docker rm cuti-postgres
```

---

## Summary

**What's Ready:**
- ✅ Environment configuration with secure JWT secret
- ✅ Prisma schema with 9 models
- ✅ NestJS API structure with auth module
- ✅ Docker available for PostgreSQL

**What You Need to Do:**
1. Start Docker Desktop
2. Run PostgreSQL container
3. Run migrations: `pnpm db:migrate dev --name init`
4. Start API: `pnpm --filter @cuti/api dev`
5. Test endpoints with curl commands above

**Documentation Created:**
- `DEV_SETUP.md` - Comprehensive guide
- `POSTGRESQL_SETUP.md` - PostgreSQL-specific instructions
- `QUICKSTART.md` - This file
- `.env.example` - Environment template for team
