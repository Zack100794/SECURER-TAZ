# 🚀 Quick Start Guide - Securer

## Setup (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env.local
# Edit .env.local with:
#   - Supabase credentials
#   - LLM provider (ollama or openai)

# 3. Initialize database
npx supabase db push
npm run parse-questionnaire

# 4. Start LLM (if using Ollama)
ollama serve
ollama pull llama3

# 5. Start app
npm run dev
```

## First Assessment (10 minutes)

1. **Sign Up** at http://localhost:3000/auth/signup
2. **Create Assessment** → "My First Assessment"
3. **Complete Questionnaire** → Answer 20 questions
4. **Step 1** → AI analyzes, select a regulation
5. **Step 2** → AI extracts, select requirements
6. **Step 3** → Review AI-generated test specs
7. **Step 4** → Upload code files, generate tests
8. **Step 5** → Enter test results, download report

## Key Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npx supabase db push     # Push migrations
npx supabase db reset    # Reset database

# Scripts
npm run parse-questionnaire  # Upload questionnaire
```

## Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# LLM - Option A: Ollama (Local)
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3

# LLM - Option B: OpenAI (Cloud)
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-xxx...
OPENAI_MODEL=gpt-4
```

## Project Structure

```
app/
├── api/               # 18 API endpoints
├── auth/              # Sign-in, sign-up
├── assessments/       # Dashboard, wizard
└── page.tsx           # Landing page

lib/
├── llm/               # AI abstraction
├── supabase/          # Database clients
└── config/            # Environment

components/ui/         # 7 reusable components
supabase/migrations/   # Database schema
```

## API Quick Reference

```bash
# Questionnaires
GET  /api/questionnaires
GET  /api/questionnaires/[id]

# Assessment Steps
POST /api/assessments/[id]/responses
POST /api/assessments/[id]/step1
POST /api/assessments/[id]/step1/select
POST /api/assessments/[id]/step2
POST /api/assessments/[id]/step2/select
POST /api/assessments/[id]/step3
POST /api/assessments/[id]/step3/confirm
POST /api/assessments/[id]/step4
GET  /api/assessments/[id]/step4/download/[tcId]
POST /api/assessments/[id]/step5

# Utilities
POST /api/upload
```

## Troubleshooting

### App won't start
```bash
# Check Node version (need 18+)
node --version

# Clear cache
rm -rf .next
npm install
```

### Database errors
```bash
# Reset database
npx supabase db reset

# Re-upload questionnaire
npm run parse-questionnaire
```

### LLM not responding
```bash
# Ollama: Check if running
curl http://localhost:11434/api/tags

# OpenAI: Verify API key
echo $OPENAI_API_KEY
```

### TypeScript errors
```bash
# Restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind
- **Backend**: Next.js API Routes, Supabase PostgreSQL
- **Auth**: Supabase Auth (SSR)
- **AI**: Ollama or OpenAI
- **Validation**: Zod

## Features

✅ User authentication  
✅ Assessment management  
✅ Dynamic questionnaire  
✅ AI regulation analysis  
✅ AI requirements extraction  
✅ AI test specification  
✅ AI test generation  
✅ AI vulnerability analysis  
✅ Markdown reports  
✅ Progress tracking  

## File Upload Limits

- Max size: 50MB per file
- Supported: .py, .js, .ts, .java, .cpp, .c, .cs, .go, .rb, .php

## Need Help?

1. Check **SETUP.md** for detailed instructions
2. Review **README.md** for architecture overview
3. See **DEVELOPMENT_COMPLETE.md** for feature list
4. Check browser console for errors
5. Verify Supabase connection in dashboard

## Production Deployment

### Vercel
```bash
vercel --prod
```

### Docker
```bash
docker build -t securer .
docker run -p 3000:3000 --env-file .env.local securer
```

---

**Status**: ✅ Ready to use  
**Version**: 1.0.0  
**Support**: Check documentation files
