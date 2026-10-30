# ⚡ Quick Start Guide

Get Securer running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Supabase account (free)
- Ollama installed (for local LLM)

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Run SQL migrations in Supabase SQL Editor:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
3. Get credentials from Settings → API

### 3. Configure Environment

Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_key_here
```

### 4. Setup Ollama (Local LLM)

```bash
# Install Ollama from ollama.ai
# Then pull a model:
ollama pull llama3.1
```

### 5. Upload Questionnaire

```bash
npm run parse-questionnaire
```

### 6. Start Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Next Steps

1. **Create Account** - Sign up at `/auth/signup`
2. **Create Assessment** - Click "New Assessment"
3. **Start Building** - Implement wizard steps from [PROJECT_STATUS.md](PROJECT_STATUS.md)

## Troubleshooting

**"Invalid environment variables"**  
→ Check `.env.local` has all required values

**"Ollama connection failed"**  
→ Run `ollama serve` to start Ollama

**"Parse questionnaire failed"**  
→ Ensure migrations ran successfully first

## Documentation

- [README.md](README.md) - Project overview
- [SETUP.md](SETUP.md) - Detailed setup guide
- [PROJECT_STATUS.md](PROJECT_STATUS.md) - What's done, what's next
- [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) - Complete specs

---

**Ready to code!** 🚀
