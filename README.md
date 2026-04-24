# Audio Transcription App

A production-ready full-stack application for audio transcription using Google Gemini API. Built with Next.js, PostgreSQL, Prisma, and Better Auth.

---

## Features

- **Admin Authentication** - Username/password login with Better Auth
- **Audio Upload** - Upload audio files (< 10MB) for transcription
- **AI Transcription** - Uses Google Gemini API to transcribe audio
- **Transcript Management** - View and delete transcripts
- **Secure** - Protected routes, input validation, session management

---

## Tech Stack

| Layer      | Technology              |
| ---------- | ----------------------- |
| Framework  | Next.js 15 (App Router) |
| Database   | PostgreSQL              |
| ORM        | Prisma                  |
| Auth       | Better Auth             |
| AI Service | Google Gemini API       |
| Styling    | Tailwind CSS            |
| Validation | Zod                     |

---

## Project Structure

```
my-app/
├── app/
│   ├── api/
│   │   ├── auth/[...all]/     # Better Auth API routes
│   │   └── transcripts/       # Transcript CRUD API
│   ├── dashboard/             # Admin dashboard page
│   ├── login/                 # Login page
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home/redirect page
├── components/                # React components
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── auth.ts                # Better Auth configuration
│   ├── auth-client.ts         # Auth client helper
│   ├── db.ts                  # Prisma client
│   ├── gemini.ts              # Gemini API integration
│   └── utils.ts               # Utility functions
├── prisma/
│   └── schema.prisma          # Database schema
├── scripts/
│   └── seed-admin.ts          # Admin user seed script
├── .env.example               # Environment variables template
└── next.config.ts             # Next.js configuration
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or Railway)

### 1. Clone & Install

```bash
cd my-app
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:

| Variable              | Description                       |
| --------------------- | --------------------------------- |
| `DATABASE_URL`        | PostgreSQL connection string      |
| `BETTER_AUTH_SECRET`  | Random secret for auth (generate) |
| `BETTER_AUTH_URL`     | Your app URL                      |
| `NEXT_PUBLIC_APP_URL` | Your app URL (client-side)        |
| `GEMINI_API_KEY`      | Google Gemini API key             |

Generate a secret:

```bash
npx better-auth@latest secret
```

### 3. Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed admin user
npx tsx scripts/seed-admin.ts
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Default Admin Credentials

After running the seed script:

| Field    | Value      |
| -------- | ---------- |
| Username | `admin`    |
| Password | `admin123` |

> Change the password in production by updating `scripts/seed-admin.ts`

---

## Deployment (Railway)

### 1. Create Railway Project

```bash
npm install -g @railway/cli
railway login
railway init
```

### 2. Add PostgreSQL Plugin

```bash
railway add --plugin postgresql
```

### 3. Configure Environment Variables

In Railway dashboard, add these variables:

| Variable              | Value                              |
| --------------------- | ---------------------------------- |
| `DATABASE_URL`        | (auto-filled by PostgreSQL plugin) |
| `BETTER_AUTH_SECRET`  | `$(openssl rand -base64 32)`       |
| `BETTER_AUTH_URL`     | `https://your-app.railway.app`     |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.railway.app`     |
| `GEMINI_API_KEY`      | Your Gemini API key                |

### 4. Deploy

```bash
railway up
```

### 5. Seed Admin User

```bash
railway run npx tsx scripts/seed-admin.ts
```

---

## API Endpoints

| Method | Endpoint           | Description          | Auth Required |
| ------ | ------------------ | -------------------- | ------------- |
| ALL    | `/api/auth/*`      | Better Auth handlers | No            |
| GET    | `/api/transcripts` | List all transcripts | Yes           |
| POST   | `/api/transcripts` | Upload & transcribe  | Yes           |
| DELETE | `/api/transcripts` | Delete a transcript  | Yes           |

---

## Security Notes

- All admin-only routes are protected by middleware
- Passwords are hashed with bcrypt via Better Auth
- Audio files are not stored - only transcribed
- Input validation with Zod on all API routes
- CSRF protection enabled

---

## License

MIT
