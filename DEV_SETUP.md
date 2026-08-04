# CUTI Development Environment Setup Guide

## Current Status
✅ Project structure analyzed
✅ Environment templates created
✅ Prisma schema verified
⚠️ PostgreSQL needs setup
⏳ Database migration pending

---

## 1. PostgreSQL Installation

### Issue Found
PostgreSQL 16 is partially installed at `C:\Program Files\PostgreSQL\16` but the `bin` directory is missing, indicating an incomplete installation.

### Recommended Solution: Use Docker (Easiest)

#### Prerequisites
- Install Docker Desktop: https://www.docker.com/products/docker-desktop/

#### Start PostgreSQL Container
```powershell
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

### Alternative: Fresh PostgreSQL Installation

1. **Uninstall existing PostgreSQL** (optional but recommended)
   - Go to Control Panel → Programs → Uninstall
   - Remove PostgreSQL 16

2. **Download and Install**
   - Visit: https://www.postgresql.org/download/windows/
   - Download PostgreSQL 16.x installer from EDB
   - Run installer with these settings:
     - Components: PostgreSQL Server, pgAdmin 4, Command Line Tools
     - Port: 5432
     - Password: `password` (or your choice)
     - Locale: Default

3. **Verify Installation**
   ```powershell
   # Add to PATH (replace 16 with your version if different)
   $env:PATH += ";C:\Program Files\PostgreSQL\16\bin"
   
   # Test
   psql --version
   
   # Create database
   psql -U postgres
   # Then in psql:
   # CREATE DATABASE cuti_dev;
   # \q
   ```

---

## 2. Environment Configuration

### Root .env (Already Created)
Location: `D:\cuti\.env`
- Contains shared database URL for the monorepo

### API .env (Already Created)
Location: `D:\cuti\apps\api\.env`

**Important:** The JWT_SECRET has been auto-generated with a secure random value.

#### Update Required Values:
1. **DATABASE_URL**: If your PostgreSQL password is different, update it:
   ```
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/cuti_dev"
   ```

2. **Google OAuth** (Optional - only if you need social login):
   - Visit: https://console.cloud.google.com/apis/credentials
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URIs:
     - `http://localhost:3001/v1/auth/google/callback`
     - `http://localhost:3000/auth/callback`
   - Copy Client ID and Secret to `.env`

---

## 3. Install Dependencies

```powershell
# From project root
cd D:\cuti

# Install all dependencies
pnpm install
```

---

## 4. Run Prisma Migrations

Once PostgreSQL is running:

```powershell
# Navigate to database package
cd D:\cuti\packages\db

# Create initial migration
pnpm db:migrate dev --name init

# Generate Prisma Client
pnpm db:generate
```

Expected output:
- Migration files created in `packages/db/prisma/migrations/`
- Prisma Client generated
- All tables created in `cuti_dev` database

---

## 5. Start the API Server

```powershell
# From project root
cd D:\cuti

# Start API in development mode
pnpm --filter @cuti/api dev
```

Expected output:
```
Application is running on: http://localhost:3001
```

---

## 6. Test the Setup

### Test Health Check
```powershell
curl http://localhost:3001/v1
```

### Test Auth Endpoints

#### Register a New User
```powershell
curl -X POST http://localhost:3001/v1/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"password123\",\"name\":\"Test User\"}'
```

Expected response:
```json
{
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User",
    ...
  },
  "accessToken": "...",
  "refreshToken": "..."
}
```

#### Login
```powershell
curl -X POST http://localhost:3001/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"password123\"}'
```

---

## 7. Optional: Seed Template Data

If you want to populate the database with CV templates:

```powershell
cd D:\cuti\packages\db
pnpm db:seed:templates
```

---

## Troubleshooting

### PostgreSQL Connection Issues

1. **Check if PostgreSQL is running:**
   ```powershell
   # For Docker
   docker ps | Select-String cuti-postgres
   
   # For native installation
   Get-Service | Where-Object { $_.DisplayName -like '*PostgreSQL*' }
   ```

2. **Test connection manually:**
   ```powershell
   # Docker
   docker exec -it cuti-postgres psql -U postgres -d cuti_dev
   
   # Native
   psql -U postgres -d cuti_dev
   ```

3. **Check if database exists:**
   ```sql
   -- Inside psql
   \l                          -- List all databases
   \c cuti_dev                 -- Connect to cuti_dev
   \dt                         -- List all tables
   ```

### Port Already in Use

If port 3001 is occupied:
```powershell
# Find process using port 3001
netstat -ano | Select-String ":3001"

# Kill the process (replace PID)
Stop-Process -Id PID -Force
```

### Prisma Migration Errors

If migrations fail:
```powershell
# Reset database (WARNING: deletes all data)
cd D:\cuti\packages\db
pnpm db:push --force-reset

# Or manually drop and recreate
psql -U postgres -c "DROP DATABASE cuti_dev;"
psql -U postgres -c "CREATE DATABASE cuti_dev;"
pnpm db:migrate dev --name init
```

---

## Next Steps After Setup

1. **Start other apps:**
   ```powershell
   # User dashboard (Next.js)
   pnpm --filter @cuti/user dev
   
   # Admin dashboard
   pnpm --filter @cuti/admin dev
   ```

2. **Access applications:**
   - API: http://localhost:3001
   - User Dashboard: http://localhost:3000
   - Admin Dashboard: http://localhost:3002

3. **Explore the database:**
   ```powershell
   cd D:\cuti\packages\db
   pnpm db:studio
   ```
   Opens Prisma Studio at http://localhost:5555

---

## Summary of Created Files

- ✅ `D:\cuti\.env` - Root environment variables
- ✅ `D:\cuti\apps\api\.env` - API environment with generated JWT secret
- ✅ `D:\cuti\apps\api\.env.example` - Template for team sharing
- ✅ `D:\cuti\POSTGRESQL_SETUP.md` - Detailed PostgreSQL setup guide
- ✅ `D:\cuti\DEV_SETUP.md` - This comprehensive setup guide

## Environment Variables Summary

### Root .env
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/cuti_dev"
```

### apps/api/.env
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/cuti_dev"
JWT_SECRET="<auto-generated-64-char-hex>"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
GOOGLE_CLIENT_ID="<your-client-id>"
GOOGLE_CLIENT_SECRET="<your-client-secret>"
CORS_ORIGINS="http://localhost:3000,http://localhost:3002"
```
