# CUTI - Development Guide

Quick guide untuk running CUTI development environment.

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and can be started
- Node.js ≥ 20.x
- pnpm ≥ 9.x
- PowerShell (Windows)

### Start Everything (One Command)

```powershell
.\dev.ps1
```

**What it does:**
1. ✅ Checks and starts Docker Desktop (if needed)
2. ✅ Starts PostgreSQL container (automatic)
3. ✅ Runs database migrations (first time only)
4. ✅ Seeds templates (first time only)
5. ✅ Checks for port conflicts
6. ✅ Starts all services in separate windows:
   - API Backend (port 3001)
   - Landing Page (port 4321)
   - Admin Panel (port 3002)
7. ✅ Monitors startup and shows status

### Stop Everything

```powershell
.\stop.ps1
```

Gracefully stops all services and PostgreSQL container.

---

## 📋 Services & Ports

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| **API Backend** | 3001 | http://localhost:3001 | NestJS REST API |
| **Landing Page** | 4321 | http://localhost:4321 | Astro static site |
| **Admin Panel** | 3002 | http://localhost:3002 | Next.js admin dashboard |
| **Dashboard** | 3000 | http://localhost:3000 | Next.js user dashboard (WIP) |
| **PostgreSQL** | 5432 | localhost:5432 | Database |

---

## 🔧 Advanced Usage

### Skip Migrations/Seeds (Faster Startup)

After first run, skip setup steps:

```powershell
.\dev.ps1 -SkipMigrations -SkipSeeds
```

### Start Individual Services

```powershell
# API only
pnpm --filter @cuti/api dev

# Landing page only
pnpm --filter @cuti/web dev

# Admin panel only
pnpm --filter @cuti/admin dev

# All at once (mixed logs)
pnpm dev
```

### Database Management

```powershell
# Open Prisma Studio (GUI for database)
pnpm --filter @cuti/db db:studio

# Run migrations manually
pnpm --filter @cuti/db db:migrate dev

# Reset database (WARNING: deletes all data)
pnpm --filter @cuti/db db:reset

# Seed templates
pnpm --filter @cuti/db db:seed:templates
```

### Docker Management

```powershell
# View PostgreSQL logs
docker logs cuti-postgres

# Stop PostgreSQL
docker stop cuti-postgres

# Start PostgreSQL
docker start cuti-postgres

# Remove PostgreSQL container
docker rm cuti-postgres

# Connect to PostgreSQL CLI
docker exec -it cuti-postgres psql -U postgres -d cuti_dev
```

---

## 🧪 Testing API

### Register User

```powershell
curl -X POST http://localhost:3001/v1/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"Test123!\",\"name\":\"Test User\"}'
```

### Login

```powershell
curl -X POST http://localhost:3001/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"Test123!\"}'
```

### Create CV (need JWT token from login)

```powershell
$token = "your_jwt_token_here"

curl -X POST http://localhost:3001/v1/cv `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d '{\"title\":\"My CV\",\"personalInfo\":{\"fullName\":\"Test User\",\"email\":\"test@example.com\"}}'
```

---

## 🐛 Troubleshooting

### Port Already in Use

**Error:** "Port 3001 is already in use"

**Solution:**
```powershell
# Find process using port
netstat -ano | findstr :3001

# Kill process by PID
taskkill /PID <PID> /F

# Or use stop script
.\stop.ps1
```

### Docker Not Starting

**Error:** "Docker Desktop is not running"

**Solution:**
1. Open Docker Desktop manually
2. Wait for it to fully start (30-60 seconds)
3. Run `.\dev.ps1` again

### PostgreSQL Connection Failed

**Error:** "Can't reach database server"

**Solution:**
```powershell
# Check if container is running
docker ps | findstr cuti-postgres

# View logs
docker logs cuti-postgres

# Restart container
docker restart cuti-postgres
```

### Migrations Failed

**Error:** "Migration failed"

**Solution:**
```powershell
# Reset database (WARNING: deletes data)
cd packages\db
pnpm db:reset

# Or drop and recreate manually
docker exec -it cuti-postgres psql -U postgres -c "DROP DATABASE cuti_dev;"
docker exec -it cuti-postgres psql -U postgres -c "CREATE DATABASE cuti_dev;"

# Run migrations again
pnpm db:migrate dev --name init
```

### Dependencies Error

**Error:** "Module not found"

**Solution:**
```powershell
# Clean and reinstall
pnpm clean
pnpm install

# Rebuild packages
pnpm build
```

---

## 📁 Project Structure

```
D:\cuti\
├── apps/
│   ├── api/              # NestJS Backend (Port 3001)
│   ├── web/              # Astro Landing (Port 4321)
│   ├── admin/            # Next.js Admin (Port 3002)
│   └── dashboard/        # Next.js Dashboard (Port 3000) - WIP
├── packages/
│   ├── db/               # Prisma Schema + Client
│   └── types/            # Shared TypeScript types
├── docs/                 # Documentation
├── dev.ps1               # 🚀 Start all services
├── stop.ps1              # 🛑 Stop all services
└── README_DEV.md         # This file
```

---

## 🎯 Development Workflow

### Day-to-Day Development

1. **Start:** `.\dev.ps1 -SkipMigrations -SkipSeeds`
2. **Code:** Edit files, auto-reload works
3. **Test:** Use Postman/curl for API, browser for frontend
4. **Stop:** `.\stop.ps1` or close terminal windows

### After Git Pull

```powershell
# Update dependencies
pnpm install

# Run new migrations (if any)
pnpm --filter @cuti/db db:migrate dev

# Restart services
.\dev.ps1 -SkipSeeds
```

### Before Git Push

```powershell
# Lint code
pnpm lint

# Build all apps
pnpm build

# Run tests (when available)
pnpm test
```

---

## 📚 Documentation

- **Design System:** `docs/design-system.md`
- **Component Library:** `docs/component-library.md`
- **Page Specifications:** `docs/page-specifications.md`
- **API Contract:** `docs/api-contract.md`
- **Architecture:** `docs/architecture.md`
- **Implementation Progress:** `docs/implementation-progress.md`

---

## 💡 Tips

- Each service runs in **separate PowerShell window** (easier to debug)
- **Ctrl+C** in a window stops that service
- Use **Prisma Studio** for GUI database management: `pnpm db:studio`
- Check **API logs** for debugging backend issues
- Use **browser DevTools** for frontend debugging
- **Hot reload** works on all services (save and refresh)

---

## 🆘 Need Help?

1. Check `docs/` folder for detailed documentation
2. Read error messages carefully (they're usually helpful)
3. Check Docker Desktop is running
4. Verify PostgreSQL container status: `docker ps`
5. Check port conflicts: `netstat -ano | findstr :3001`

---

**Happy Coding! 🚀**
