# PostgreSQL Setup Instructions for CUTI Project

## Option 1: Start Existing PostgreSQL Installation

PostgreSQL 16 is installed at: `C:\Program Files\PostgreSQL\16`

### Step 1: Add PostgreSQL to PATH (Current Session)
```powershell
$env:PATH += ";C:\Program Files\PostgreSQL\16\bin"
```

### Step 2: Add PostgreSQL to PATH (Permanent)
```powershell
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\PostgreSQL\16\bin", "User")
```

### Step 3: Find and Start PostgreSQL Service
```powershell
# Find the service
Get-Service | Where-Object { $_.DisplayName -like '*PostgreSQL*' }

# Start the service (replace SERVICE_NAME with actual name)
Start-Service -Name "postgresql-x64-16"
```

### Step 4: Verify PostgreSQL is Running
```powershell
psql --version
```

### Step 5: Create the Database
```powershell
# Connect to PostgreSQL (default password is usually what you set during installation)
psql -U postgres

# Inside psql, run:
CREATE DATABASE cuti_dev;
\q
```

---

## Option 2: Install PostgreSQL from Scratch

If the existing installation is corrupted or not working:

### Download PostgreSQL
1. Visit: https://www.postgresql.org/download/windows/
2. Download PostgreSQL 16.x installer
3. Run the installer

### Installation Settings
- Port: 5432 (default)
- Set a password for the `postgres` user (remember this!)
- Install Stack Builder: Optional

### After Installation
1. PostgreSQL service should start automatically
2. Add to PATH: `C:\Program Files\PostgreSQL\16\bin`
3. Create database:
```bash
psql -U postgres
CREATE DATABASE cuti_dev;
\q
```

---

## Option 3: Use Docker (Recommended for Development)

### Start PostgreSQL Container
```powershell
docker run --name cuti-postgres `
  -e POSTGRES_PASSWORD=password `
  -e POSTGRES_DB=cuti_dev `
  -p 5432:5432 `
  -d postgres:16-alpine
```

### Verify Container is Running
```powershell
docker ps
```

### Connect to Database
```powershell
docker exec -it cuti-postgres psql -U postgres -d cuti_dev
```

---

## Database Connection String

Update your `.env` file with the correct connection string:

**Local PostgreSQL:**
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/cuti_dev"
```

**Docker:**
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/cuti_dev"
```

---

## Next Steps After PostgreSQL is Running

1. Test connection:
```powershell
psql -U postgres -d cuti_dev -c "SELECT version();"
```

2. Run Prisma migrations (from project root):
```powershell
cd packages/db
pnpm db:migrate dev --name init
```

3. Generate Prisma Client:
```powershell
pnpm db:generate
```
