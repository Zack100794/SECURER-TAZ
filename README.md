# 🔐 Securer - Cybersecurity Compliance Assessment Platform

Automated cybersecurity compliance assessment for smart home systems. Leverages AI to recommend regulations, generate test cases, and produce comprehensive security reports.

## 🌟 Features

- **Intelligent Questionnaire**: Comprehensive assessment of smart home system requirements
- **AI-Powered Analysis**: Automatic regulation recommendation based on user needs
- **Test Generation**: Automated security test case generation from uploaded code
- **Compliance Reports**: Detailed vulnerability analysis and actionable recommendations
- **Multi-Environment Support**: Works with both local LLMs (Ollama) and cloud providers (OpenAI)

## 🏗️ Tech Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth
- **LLM Integration**: Unified abstraction layer supporting:
  - Ollama (local development)
  - OpenAI GPT-4 (production)
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **File Processing**: Cheerio, PDF-lib, Mammoth

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- For local development: Ollama installed
- For production: OpenAI API key

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd securer
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the database migrations:
   - Navigate to SQL Editor in Supabase Dashboard
   - Execute `supabase/migrations/001_initial_schema.sql`
   - Execute `supabase/migrations/002_rls_policies.sql`

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update `.env.local` with your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# For local development (Ollama)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
LLM_PROVIDER=ollama

# For production (OpenAI)
# OPENAI_API_KEY=your_openai_api_key
# LLM_PROVIDER=openai
```

### 4. Set Up Local LLM (Optional - for local development)

Install Ollama from [ollama.ai](https://ollama.ai), then:

```bash
# Pull a model
ollama pull llama3.1

# Start Ollama server (usually auto-starts)
ollama serve
```

### 5. Upload Questionnaire Data

```bash
npm run parse-questionnaire
```

This parses the Smart Home Requirements Questionnaire and uploads it to your Supabase database.

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Project Structure

```
securer/
├── app/                          # Next.js App Router pages
│   ├── auth/                     # Authentication pages
│   ├── assessments/              # Assessment pages
│   └── api/                      # API routes
├── lib/                          # Core libraries
│   ├── config/                   # Configuration
│   ├── llm/                      # LLM abstraction layer
│   └── supabase/                 # Supabase utilities
├── components/                   # React components
├── supabase/                     # Database migrations
├── scripts/                      # Utility scripts
├── types/                        # TypeScript types
└── docs/                         # Documentation
```

## 🔄 Assessment Workflow

1. **Step 0: Questionnaire** - User answers questions about their smart home system
2. **Step 1: Regulation Analysis** - AI recommends relevant cybersecurity standards
3. **Step 2: Requirements Extraction** - System extracts testable security requirements
4. **Step 3: Test Specifications** - Formal test specs are generated
5. **Step 4: Test Case Generation** - Executable test cases created from uploaded code
6. **Step 5: Vulnerability Analysis** - Test results analyzed, compliance report generated

## 🤖 LLM Provider Auto-Detection

The system automatically selects the appropriate LLM provider:

1. **Explicit Configuration**: Use `LLM_PROVIDER` env variable
2. **Auto-detect (Production)**: If `OPENAI_API_KEY` is set, uses OpenAI
3. **Auto-detect (Local)**: Falls back to Ollama for local development

## 🔒 Security Features

- **Row Level Security (RLS)**: All user data is isolated at the database level
- **Authentication**: Secure authentication via Supabase Auth
- **Environment Validation**: Zod-based environment variable validation
- **Protected Routes**: Middleware-enforced authentication
- **Input Validation**: Comprehensive form validation with Zod

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run parse-questionnaire` - Upload questionnaire to database

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

Compatible with any platform supporting Next.js 15.

## 🛠️ Development

See [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) for detailed implementation guidance.

## 📧 Support

For issues or questions, please open a GitHub issue.

---

**Built with ❤️ for cybersecurity compliance**
