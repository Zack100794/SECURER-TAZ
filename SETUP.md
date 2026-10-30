# 🚀 Securer Setup Guide

This guide will help you get Securer up and running on your local machine.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] npm or yarn package manager
- [ ] Supabase account (free tier)
- [ ] For local dev: Ollama installed
- [ ] For production: OpenAI API key

## Step-by-Step Setup

### 1. Install Dependencies

All dependencies are already installed if you ran `npm install`. If not:

```bash
npm install
```

### 2. Set Up Supabase

#### Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - Name: `securer` (or your preferred name)
   - Database Password: (save this securely)
   - Region: Choose closest to you
4. Wait for project to be created (~2 minutes)

#### Run Database Migrations

1. In your Supabase Dashboard, go to "SQL Editor"
2. Create a new query
3. Copy content from `supabase/migrations/001_initial_schema.sql`
4. Paste and click "Run"
5. Repeat for `supabase/migrations/002_rls_policies.sql`

You should see success messages for both migrations.

#### Get Supabase Credentials

1. Go to Project Settings → API
2. Copy these values:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key**: `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### 3. Configure Environment Variables

#### Create .env.local

The `.env.local` file already exists. Update it with your Supabase credentials:

```env
# Supabase - UPDATE THESE
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI (Optional - for production)
OPENAI_API_KEY=

# Ollama (Default for local development)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
LLM_PROVIDER=ollama

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set Up Local LLM (Ollama)

#### Install Ollama

**macOS/Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download from [ollama.ai](https://ollama.ai/download)

#### Pull a Model

```bash
# Recommended model
ollama pull llama3.1

# Alternative models
ollama pull llama3
ollama pull mistral
ollama pull mixtral
```

#### Verify Ollama is Running

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Should return JSON with installed models
```

### 5. Upload Questionnaire Data

Run the questionnaire parser script:

```bash
npm run parse-questionnaire
```

You should see output like:
```
📄 Parsing questionnaire HTML...
✓ Creating new questionnaire...
📌 Parsing section: Your Goals & Purpose
  ✓ Q1: radio (6 options)
  ✓ Q2: checkbox (6 options)
...
✅ Successfully parsed and uploaded questionnaire!
```

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

You should see the Securer landing page!

## Verify Setup

### Test Authentication

1. Go to http://localhost:3000
2. Click "Get Started" or "Sign Up"
3. Create an account
4. You should be redirected to `/assessments`

### Test Database Connection

Check Supabase Dashboard → Table Editor:
- `profiles` table should have your user
- `questionnaires` table should have 1 entry
- `questions` table should have ~15 questions

### Test LLM Connection

If using Ollama locally:

```bash
# Test Ollama API
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1",
  "prompt": "Say hello"
}'
```

## Common Issues

### Issue: "Invalid environment variables"

**Solution:** Make sure all required env variables are set in `.env.local`

### Issue: Ollama connection failed

**Solutions:**
1. Verify Ollama is running: `ollama serve`
2. Check model is downloaded: `ollama list`
3. Verify port 11434 is not blocked

### Issue: Supabase RLS policy errors

**Solution:** Ensure both migration files were run successfully in order

### Issue: Parse questionnaire fails

**Solutions:**
1. Verify `SUPABASE_SERVICE_ROLE_KEY` is set
2. Check questionnaire HTML exists in `docs/` folder
3. Run migrations first

## Next Steps

### Option A: Use Local Development (Ollama)

You're all set! The app will use Ollama for all LLM operations.

### Option B: Use OpenAI (Production)

1. Get OpenAI API key from [platform.openai.com](https://platform.openai.com)
2. Add to `.env.local`:
   ```env
   OPENAI_API_KEY=sk-...
   LLM_PROVIDER=openai
   ```
3. Restart dev server

## Development Workflow

1. **Start dev server**: `npm run dev`
2. **Make changes** to code
3. **Test locally** with Ollama
4. **Commit changes** to git
5. **Deploy** to Vercel (or other platform)

## Project Structure

```
securer/
├── app/                    # Next.js pages and API routes
│   ├── auth/              # Authentication pages
│   ├── assessments/       # Assessment dashboard and wizard
│   └── api/               # API endpoints (to be implemented)
├── lib/                   # Core libraries
│   ├── llm/              # LLM abstraction layer ✅
│   ├── supabase/         # Database clients ✅
│   └── config/           # Configuration ✅
├── components/            # React components
│   ├── ui/               # UI components ✅
│   └── wizard/           # Wizard components (to be implemented)
├── supabase/             # Database migrations ✅
│   └── migrations/
├── scripts/              # Utility scripts ✅
└── types/                # TypeScript types ✅
```

## What's Implemented

✅ **Core Infrastructure**
- Next.js 15 with TypeScript
- Tailwind CSS styling
- Supabase database with RLS
- Environment configuration

✅ **Authentication**
- Sign up / Sign in pages
- Session management
- Protected routes

✅ **LLM Integration**
- Unified LLM client
- Ollama adapter
- OpenAI adapter
- Auto-detection logic
- Structured prompts for all 5 steps

✅ **Database**
- Complete schema
- Row Level Security policies
- All tables created

✅ **UI Components**
- Button, Input, Card
- Badge, Alert, Spinner
- Responsive design

✅ **Basic Pages**
- Landing page
- Assessments dashboard
- New assessment page
- Authentication pages

## What Needs Implementation

🔨 **Assessment Wizard Steps** (Step 1-5)
- API routes for each step
- Frontend components
- LLM integration

🔨 **Questionnaire**
- Dynamic form rendering
- Response saving
- Validation

🔨 **File Upload**
- Upload infrastructure
- File parsing
- Storage integration

🔨 **Report Generation**
- PDF generation
- Markdown export
- Report visualization

## Getting Help

- Check [README.md](README.md) for overview
- Review [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) for detailed specs
- Open GitHub issue for bugs

## Ready to Build!

You now have a fully configured development environment. The core infrastructure is in place:

1. ✅ Authentication system
2. ✅ Database with security
3. ✅ LLM abstraction layer
4. ✅ UI component library
5. ✅ Project structure

Next: Implement the assessment wizard steps following the implementation plan!

---

**Happy coding! 🚀**
