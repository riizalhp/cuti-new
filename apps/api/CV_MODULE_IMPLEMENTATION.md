# CV Module Implementation - Testing Guide

## Overview
The CV Module (Sprint 2, Tasks 6-10) has been fully implemented for the CUTI NestJS API.

## Implemented Features

### Task 6: CV CRUD Endpoints ✅
**Location:** `D:\cuti\apps\api\src\cv\`

**Endpoints:**
- `POST /v1/cv` - Create CV (auth required)
- `GET /v1/cv` - List user's CVs with pagination (auth required)
- `GET /v1/cv/:id` - Get single CV (auth + owner check)
- `PATCH /v1/cv/:id` - Update CV (auth + owner check)
- `DELETE /v1/cv/:id` - Delete CV (auth + owner check)
- `PATCH /v1/cv/:id/primary` - Set as primary CV (auth + owner)

**Files Created:**
- `cv/cv.module.ts` - Module configuration
- `cv/cv.controller.ts` - Route handlers with guards
- `cv/cv.service.ts` - Business logic with ATS calculation
- `cv/dto/create-cv.dto.ts` - Create CV validation
- `cv/dto/update-cv.dto.ts` - Update CV validation
- `cv/dto/cv-response.dto.ts` - Response mapper

### Task 7: Template System ✅
**Location:** `D:\cuti\apps\api\src\template\`

**Endpoints:**
- `GET /v1/template` - List all templates (public)
- `GET /v1/template/:id` - Get single template (public)

**Files Created:**
- `template/template.module.ts`
- `template/template.controller.ts`
- `template/template.service.ts`
- `template/dto/template-response.dto.ts`

**Seed Script:**
- `D:\cuti\packages\db\prisma\seeds\templates.seed.ts`
- Three templates: ATS Modern, ATS Standard, Fresh Graduate
- Run: `cd packages/db && pnpm db:seed:templates`

### Task 8: ATS Score Calculator ✅
**Location:** `D:\cuti\apps\api\src\cv\services\ats-calculator.service.ts`

**Scoring Algorithm:**
- Keyword matching (filled sections): 40%
- Completeness (required fields): 30%
- Formatting (consistency): 20%
- Experience relevance: 10%
- Returns score 0-100

**Features:**
- Automatic calculation on CV create/update
- Stored in `cv.atsScore` field
- Completeness percentage tracked separately

### Task 10: CV Owner Guard ✅
**Location:** `D:\cuti\apps\api\src\cv\guards\cv-owner.guard.ts`

**Functionality:**
- Verifies user authentication via AuthGuard
- Checks user owns the CV being accessed
- Throws 403 Forbidden if not owner
- Throws 404 if CV not found
- Applied to all CV endpoints except list

## Testing Examples

### 1. Register a User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {...},
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### 2. Create a CV
```bash
curl -X POST http://localhost:3000/v1/cv \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Software Engineer CV",
    "personalInfo": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "location": "Jakarta, Indonesia"
    },
    "summary": "Experienced software engineer with 5 years in web development",
    "experiences": [
      {
        "company": "Tech Corp",
        "position": "Senior Developer",
        "startDate": "2020-01",
        "endDate": "2024-12",
        "isCurrent": false,
        "description": "Led development of microservices architecture"
      }
    ],
    "education": [
      {
        "institution": "University of Indonesia",
        "degree": "Bachelor of Computer Science",
        "field": "Computer Science",
        "startDate": "2015-08",
        "endDate": "2019-06",
        "gpa": 3.8
      }
    ],
    "skills": [
      {"name": "TypeScript", "level": "expert"},
      {"name": "React", "level": "advanced"},
      {"name": "Node.js", "level": "advanced"}
    ]
  }'
```

### 3. List User's CVs (with pagination)
```bash
curl -X GET "http://localhost:3000/v1/cv?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

### 4. Get Single CV
```bash
curl -X GET http://localhost:3000/v1/cv/CV_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Update CV
```bash
curl -X PATCH http://localhost:3000/v1/cv/CV_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Updated summary with more details"
  }'
```

### 6. Set CV as Primary
```bash
curl -X PATCH http://localhost:3000/v1/cv/CV_ID/primary \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 7. Delete CV
```bash
curl -X DELETE http://localhost:3000/v1/cv/CV_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 8. List Templates (Public)
```bash
curl -X GET http://localhost:3000/v1/template
```

### 9. Get Single Template
```bash
curl -X GET http://localhost:3000/v1/template/TEMPLATE_ID
```

## Response Format
All endpoints return responses in the format:
```json
{
  "success": true,
  "data": {...}
}
```

Errors return:
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

## Security Features
- All CV endpoints require authentication (AuthGuard)
- CV access protected by ownership check (CvOwnerGuard)
- Zod validation on all inputs
- TypeScript strict mode, no `any` types

## Next Steps
1. Run seed script to populate templates
2. Start the API server: `cd apps/api && pnpm dev`
3. Test endpoints with curl or Postman
4. Verify ATS scores are calculated correctly
5. Test owner guard prevents unauthorized access

## Notes
- Task 9 (PDF Generation) was skipped as requested
- Completeness score tracks percentage of filled sections
- ATS score auto-recalculates on every update
- Primary CV flag: only one CV can be primary per user
