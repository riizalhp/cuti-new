# CUTI — Database Schema

## Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== ENUMS ====================

enum UserRole {
  free
  premium
  admin
}

enum CvStatus {
  draft
  active
  archived
}

enum ApplicationStatus {
  sent
  screening
  interview
  offering
  rejected
}

enum CampaignStatus {
  active
  paused
  ended
}

enum SubmissionStatus {
  pending
  approved
  rejected
}

enum WithdrawalStatus {
  pending
  processing
  completed
  failed
}

enum PaymentStatus {
  pending
  success
  failed
  expired
}

enum PaymentType {
  membership
  cv_service
  practice
  toefl
}

enum MembershipPlan {
  monthly
  quarterly
  annual
}

enum NotificationType {
  submission_status
  payment_success
  payment_failed
  campaign_new
  system
  interview_reminder
}

enum PracticeDifficulty {
  easy
  medium
  hard
}

enum TemplateCategory {
  ats_modern
  ats_standard
  executive
  creative_tech
  fresh_graduate
}

enum CoverLetterTone {
  formal
  professional
  friendly
  enthusiastic
}

// ==================== MODELS ====================

model User {
  id                String    @id @default(uuid())
  email             String    @unique
  name              String
  avatar            String?
  phone             String?
  password          String?   // null for OAuth users

  // Profile
  headline          String?
  location          String?
  targetPosition    String?
  targetIndustry    String?
  experienceLevel   String?   // fresh_graduate, experienced, career_switcher

  // Gamification
  coin              Int       @default(0)
  xp                Int       @default(0)
  level             Int       @default(1)

  // Membership
  role              UserRole  @default(free)
  membershipExpiry  DateTime?

  // Referral
  referralCode      String    @unique @default(cuid())

  // Meta
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  cvs               CV[]
  applications      JobApplication[]
  screenings        AIScreening[]
  atsMatches        ATSMatch[]
  coverLetters      CoverLetter[]
  emails            GeneratedEmail[]
  waTemplates       WATemplate[]
  interviewSessions InterviewSession[]
  linkedinAnalyses  LinkedInAnalysis[]
  campaignSubmissions CampaignSubmission[]
  withdrawals       Withdrawal[]
  payments          Payment[]
  memberships       Membership[]
  notifications     Notification[]
  userBadges        UserBadge[]
  userAnswers       UserAnswer[]
  referralsMade     Referral[]     @relation("referrer")
  referralsReceived Referral[]     @relation("referred")
  toeflSessions     TOEFLSession[]

  @@map("users")
}

model CV {
  id              String    @id @default(uuid())
  userId          String
  title           String
  templateId      String?

  // CV Data (JSON for flexibility)
  personalInfo    Json?
  summary         String?
  experiences     Json?     // [{company, position, startDate, endDate, description}]
  education       Json?     // [{institution, degree, field, startDate, endDate, gpa}]
  skills          Json?     // [{name, level}]
  certifications  Json?     // [{name, issuer, date, credentialUrl}]
  projects        Json?     // [{name, description, techStack, url}]
  languages       Json?     // [{language, proficiency}]
  organizations   Json?     // [{name, role, startDate, endDate, description}]
  portfolio       Json?     // [{title, url, description}]

  // Scores
  atsScore        Float?
  completeness    Float?

  // Status
  status          CvStatus  @default(draft)
  isPrimary       Boolean   @default(false)

  // File
  pdfUrl          String?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  template        Template? @relation(fields: [templateId], references: [id])
  screenings      AIScreening[]
  atsMatches      ATSMatch[]
  coverLetters    CoverLetter[]
  heatmaps        HeatmapResult[]

  @@index([userId])
  @@map("cvs")
}

model Template {
  id              String           @id @default(uuid())
  name            String
  category        TemplateCategory
  description     String?
  previewUrl      String
  htmlContent     String
  cssContent      String
  isPremium       Boolean          @default(false)
  price           Int?             // in IDR, null = free with premium

  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  cvs             CV[]

  @@map("templates")
}

model AIScreening {
  id                String    @id @default(uuid())
  cvId              String
  userId            String

  // Config
  recruiterType     String?   // startup, corporate, mnc, bumn
  companyType       String?

  // Results
  atsScore          Float
  status            String    // pass, fail, borderline
  recruiterNotes    String?
  keywordAnalysis   Json?     // {found: [], missing: []}
  redFlags          Json?     // [{type, description}]
  recommendations   Json?     // [{priority, text}]
  interviewQuestions Json?    // [{question, context}]

  // AI metadata
  provider          String
  model             String
  tokensUsed        Int
  cost              Float?

  createdAt         DateTime  @default(now())

  // Relations
  cv                CV        @relation(fields: [cvId], references: [id], onDelete: Cascade)
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([cvId])
  @@map("ai_screenings")
}

model ATSMatch {
  id                String    @id @default(uuid())
  cvId              String
  userId            String

  jobDescription    String

  // Results
  matchScore        Float
  hardSkillMatch    Float
  softSkillMatch    Float
  experienceMatch   Float
  educationMatch    Float
  keywordsFound     Json?     // [{keyword, found: true/false}]
  missingKeywords   Json?     // [string]
  optimization      Json?     // [{section, suggestion}]

  // AI metadata
  provider          String
  model             String
  tokensUsed        Int

  createdAt         DateTime  @default(now())

  cv                CV        @relation(fields: [cvId], references: [id], onDelete: Cascade)
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("ats_matches")
}

model CoverLetter {
  id              String         @id @default(uuid())
  userId          String
  cvId            String?

  company         String
  position        String
  recruiter       String?
  tone            CoverLetterTone
  highlights      String?

  content         String

  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  user            User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  cv              CV?            @relation(fields: [cvId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@map("cover_letters")
}

model GeneratedEmail {
  id              String    @id @default(uuid())
  userId          String

  subject         String
  recipient       String?
  tone            String
  context         String?

  content         String

  createdAt       DateTime  @default(now())

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("generated_emails")
}

model WATemplate {
  id              String    @id @default(uuid())
  userId          String

  context         String    // approaching HR, follow-up, etc
  companyName     String?
  hrName          String?

  content         String

  createdAt       DateTime  @default(now())

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("wa_templates")
}

model HeatmapResult {
  id              String    @id @default(uuid())
  cvId            String

  heatmapData     Json      // [{x, y, intensity}]
  eyeTrackingPath Json?     // [{x, y, timestamp}]

  // AI metadata
  provider        String
  model           String

  createdAt       DateTime  @default(now())

  cv              CV        @relation(fields: [cvId], references: [id], onDelete: Cascade)

  @@map("heatmap_results")
}

model JobApplication {
  id              String            @id @default(uuid())
  userId          String

  company         String
  position        String
  url             String?
  location        String?
  salary          String?

  status          ApplicationStatus @default(sent)
  appliedAt       DateTime          @default(now())
  responseAt      DateTime?
  interviewDate   DateTime?

  notes           String?
  timeline        Json?             // [{date, action, notes}]

  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  user            User              @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, status])
  @@map("job_applications")
}

model InterviewSession {
  id              String    @id @default(uuid())
  userId          String

  type            String    // mock, practice
  position        String?
  company         String?

  questions       Json?     // [{question, category}]
  answers         Json?     // [{answer, timestamp}]
  scores          Json?     // [{questionId, score, feedback}]
  overallScore    Float?
  feedback        String?

  duration        Int?      // in seconds

  createdAt       DateTime  @default(now())

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("interview_sessions")
}

model LinkedInAnalysis {
  id              String    @id @default(uuid())
  userId          String

  profileUrl      String
  ssiScore        Float?
  seoScore        Float?

  // Analysis results
  headline        Json?     // {current, score, suggestions}
  about           Json?     // {current, score, suggestions}
  experience      Json?     // {current, score, suggestions}
  keywords        Json?     // [{keyword, present, suggestion}]

  recommendations Json?

  // Generated content
  generatedContent Json?   // {headline, bio, messages}

  // AI metadata
  provider        String
  model           String
  tokensUsed      Int

  createdAt       DateTime  @default(now())

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("linkedin_analyses")
}

model Campaign {
  id              String        @id @default(uuid())
  title           String
  description     String
  rules           Json          // {steps: [], requirements: []}
  commission      Int           // in IDR
  commissionType  String        // fixed, percentage
  startDate       DateTime
  endDate         DateTime
  maxParticipants Int?
  currentParticipants Int       @default(0)
  status          CampaignStatus @default(active)
  imageUrl        String?

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  submissions     CampaignSubmission[]

  @@map("campaigns")
}

model CampaignSubmission {
  id              String           @id @default(uuid())
  campaignId      String
  userId          String

  proofUrl        String
  notes           String?

  status          SubmissionStatus @default(pending)
  commissionEarned Int?

  reviewedAt      DateTime?
  reviewedBy      String?          // admin user id

  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  campaign        Campaign         @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  user            User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([campaignId, status])
  @@map("campaign_submissions")
}

model Withdrawal {
  id              String          @id @default(uuid())
  userId          String

  amount          Int             // in IDR
  method          String          // bank, ewallet
  bankName        String?         // BCA, Mandiri, etc
  accountNumber   String
  accountName     String

  status          WithdrawalStatus @default(pending)
  notes           String?

  processedAt     DateTime?

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("withdrawals")
}

model Referral {
  id              String    @id @default(uuid())
  referrerId      String
  referredId      String
  code            String

  status          String    @default(pending) // pending, completed
  rewardAmount    Int?      // in coin

  createdAt       DateTime  @default(now())

  referrer        User      @relation("referrer", fields: [referrerId], references: [id])
  referred        User      @relation("referred", fields: [referredId], references: [id])

  @@unique([referrerId, referredId])
  @@map("referrals")
}

model Badge {
  id              String    @id @default(uuid())
  name            String    @unique
  description     String
  icon            String    // icon name or URL
  criteria        Json      // {type: "action", action: "create_cv", count: 1}

  createdAt       DateTime  @default(now())

  userBadges      UserBadge[]

  @@map("badges")
}

model UserBadge {
  id              String    @id @default(uuid())
  userId          String
  badgeId         String
  earnedAt        DateTime  @default(now())

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  badge           Badge     @relation(fields: [badgeId], references: [id], onDelete: Cascade)

  @@unique([userId, badgeId])
  @@map("user_badges")
}

model PracticeCategory {
  id              String    @id @default(uuid())
  name            String    @unique
  description     String?
  icon            String?
  isPremium       Boolean   @default(false)

  questions       PracticeQuestion[]

  @@map("practice_categories")
}

model PracticeQuestion {
  id              String            @id @default(uuid())
  categoryId      String
  difficulty      PracticeDifficulty
  question        String
  options         Json              // [{label: "A", text: "..."}, ...]
  correctAnswer   String            // "A", "B", etc
  explanation     String?
  isPremium       Boolean           @default(false)

  createdAt       DateTime          @default(now())

  category        PracticeCategory  @relation(fields: [categoryId], references: [id])
  userAnswers     UserAnswer[]

  @@index([categoryId, difficulty])
  @@map("practice_questions")
}

model UserAnswer {
  id              String    @id @default(uuid())
  userId          String
  questionId      String
  answer          String
  isCorrect       Boolean

  answeredAt      DateTime  @default(now())

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  question        PracticeQuestion @relation(fields: [questionId], references: [id])

  @@index([userId])
  @@map("user_answers")
}

model TOEFLSession {
  id              String    @id @default(uuid())
  userId          String

  sections        Json      // [{type: "listening", questions: [...], answers: [...]}]
  totalScore      Float?
  sectionScores   Json?     // {listening: 250, structure: 230, reading: 260}

  status          String    @default(in_progress) // in_progress, completed
  duration        Int?      // in seconds

  createdAt       DateTime  @default(now())
  completedAt     DateTime?

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("toefl_sessions")
}

model Membership {
  id              String          @id @default(uuid())
  userId          String
  plan            MembershipPlan
  startDate       DateTime
  endDate         DateTime
  autoRenew       Boolean         @default(true)
  paymentId       String?

  status          String          @default(active) // active, expired, cancelled

  createdAt       DateTime        @default(now())

  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("memberships")
}

model Payment {
  id                String      @id @default(uuid())
  userId            String

  type              PaymentType
  amount            Int         // in IDR
  description       String?

  // Midtrans
  midtransOrderId   String?     @unique
  midtransToken     String?
  midtransStatus    String?
  paymentMethod     String?

  status            PaymentStatus @default(pending)
  metadata          Json?       // flexible extra data

  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([midtransOrderId])
  @@map("payments")
}

model Notification {
  id              String           @id @default(uuid())
  userId          String
  type            NotificationType
  title           String
  message         String
  read            Boolean          @default(false)
  data            Json?            // {link, id, etc}

  createdAt       DateTime         @default(now())

  user            User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, read])
  @@map("notifications")
}

// ==================== CONTENT MODELS ====================

model Article {
  id              String    @id @default(uuid())
  title           String
  slug            String    @unique
  content         String
  excerpt         String?
  coverImage      String?
  category        String
  author          String
  status          String    @default(draft) // draft, published
  publishedAt     DateTime?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([status, publishedAt])
  @@map("articles")
}

model Course {
  id              String    @id @default(uuid())
  title           String
  slug            String    @unique
  description     String
  coverImage      String?
  category        String
  instructor      String?
  duration        String?
  isPremium       Boolean   @default(false)
  url             String?

  createdAt       DateTime  @default(now())

  @@map("courses")
}

model Certification {
  id              String    @id @default(uuid())
  name            String
  issuer          String
  description     String?
  url             String?
  category        String?
  price           String?
  isRecommended   Boolean   @default(false)

  createdAt       DateTime  @default(now())

  @@map("certifications")
}

model Event {
  id              String    @id @default(uuid())
  title           String
  slug            String    @unique
  description     String
  coverImage      String?
  type            String    // job_fair, webinar, workshop, career_event
  location        String?
  startDate       DateTime
  endDate         DateTime?
  url             String?

  createdAt       DateTime  @default(now())

  @@index([startDate])
  @@map("events")
}

model AIUsageLog {
  id              String    @id @default(uuid())
  userId          String
  feature         String    // screener, ats_match, cover_letter, etc
  provider        String
  model           String
  tokensUsed      Int
  cost            Float?
  metadata        Json?

  createdAt       DateTime  @default(now())

  @@index([userId, createdAt])
  @@index([feature, createdAt])
  @@map("ai_usage_logs")
}
```

## Key Design Decisions

1. **JSON fields** untuk flexible CV data (experiences, skills, etc) — gak perlu table terpisah per section, gampang extend tanpa migration
2. **CV jadi central entity** — screening, ATS match, cover letter semua reference CV
3. **AI tracking** — setiap AI call record provider, model, tokens, cost untuk monitoring
4. **Unified payment table** — handle semua jenis transaksi (membership, CV service, practice, TOEFL)
5. **Soft-delete tidak dipakai** — hard delete dengan cascade, data sensitive CV harus hilang kalau user delete
6. **AIUsageLog terpisah** — untuk analytics dan cost monitoring, tidak dihapus saat user delete (anonymized)
