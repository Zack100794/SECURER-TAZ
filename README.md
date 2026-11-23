# 🔐 Securer - Cybersecurity Compliance Assessment Platform

Automated cybersecurity compliance assessment for smart home systems. Leverages AI to recommend regulations, generate test cases, and produce comprehensive security reports.

## 🌟 Features

- **Intelligent Questionnaire**: Comprehensive assessment of smart home system requirements
- **AI-Powered Analysis**: Automatic regulation recommendation based on user needs
- **Test Generation**: Automated security test case generation from uploaded code
- **Compliance Reports**: Detailed vulnerability analysis and actionable recommendations
- **Multi-Environment Support**: Works with both local LLMs (Ollama) and cloud providers (OpenAI)

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth
- **LLM Integration**: Unified abstraction layer supporting:
  - Ollama with Llama 3.1 or Llama 3.2:1b/latest (local development)
  - OpenAI GPT-4o
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **File Processing**: Cheerio, PDF-lib, Mammoth

## 📋 Prerequisites
- OS Windows (Recommended)
- Visual Studio (Recommended) 
- Node.js 18+ and npm
- Supabase account (free tier works)
- For local development: Ollama installed (Desktop version)
- For production: OpenAI API key

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd securer-taz
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the database migrations:
   - Navigate to SQL Editor in Supabase Dashboard
   - Execute `supabase/migrations/001_initial_schema.sql`
   - Execute `supabase/migrations/002_rls_policies.sql`
   - Execute `supabase/migrations/003_grant_permissions.sql`


### 3. Configure Environment Variables

Create or update `.env.local` in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Ollama - choose either supported model below
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
# Or use Llama 3.2 instead:
# OLLAMA_MODEL=llama3.2:latest

# To use OpenAI instead:
# LLM_PROVIDER=openai
# OPENAI_API_KEY=your_openai_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

If you are not familiar with Supabase, follow these steps to find the required URL and API keys:

1. Open the [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
2. Click the **Copy** button under the name of your project in the top-left area of the project (under the project name) and copy the **Project URL**. Use this value for `NEXT_PUBLIC_SUPABASE_URL`.
3. Go to **Project Settings → API Keys** and open the **Legacy API Keys** tab, which may be labelled **Legacy anon, service_role API keys**.
4. Copy the **anon** key and use it for `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Reveal and copy the **service_role** key and use it for `SUPABASE_SERVICE_ROLE_KEY`.

Add these values to your project's `.env.local` file:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Keep the `service_role` key confidential and use it only on the server. Never prefix it with `NEXT_PUBLIC_` or commit your `.env.local` file to version control.


Never commit `.env.local` or share your API keys. `LLM_PROVIDER` selects the provider; `OLLAMA_MODEL` selects which Ollama model to run. Use `LLM_PROVIDER=ollama` for either Llama version, and change only `OLLAMA_MODEL` to switch between them. For OpenAI, set `LLM_PROVIDER=openai` and configure a valid `OPENAI_API_KEY`.

### 4. Set Up Local LLM (Ollama)

Install Ollama from [ollama.ai](https://ollama.ai), then:

```bash
# Pull either or both supported models
ollama pull llama3.1
ollama pull llama3.2:1b 
ollama pull llama3.2


Note: ollama pull llama3.2:1b recommended for Linux users as CPU utilization and Ollama response time is ideal for this model. The ollama response time can be increased via securer-taz llm/adapters/ollama.ts. For now its 5 minutes and running perefectly for llama 3.1, llama 3.2 and llama3.2:1b via Windows ollama desktop as recommended settings in first place.

# Start Ollama server (usually auto-starts)
ollama serve

Note: Its better to check ollama status via OLLAMA_BASE_URL=http://localhost:11434 to make sure ollama is running (desktop version of ollama is recommended). In case of ollama adaptor error or timeout change the ollama model and restart npm run dev.

For Llama 3.1 and Llama 3.2 set OLLAMA_MODEL=llama3.2:latest in .env.local but for llama3.2:1b set OLLAMA_MODEL=llama3.2:1b in .env.local. Keep LLM_PROVIDER=ollama for all above mentioned three models. Restart the Next.js development server after changing environment variables as per your requirements.

Note: While using ollama wrote LLM_PROVIDER=ollama and keep OPENAI_API_KEY=your_openai_api_key as empty or null such as OPENAI_API_KEY= in .env.local`

### Using OpenAI instead of Ollama

Set these values in `.env.local`:

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key
```

The application uses OpenAI's `gpt-4o` model. Do not publish or commit your API key. Restart the development server after changing providers.

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

## 🤖 LLM Provider Configuration

Choose the provider explicitly in `.env.local`:

- `LLM_PROVIDER=ollama` uses Ollama at `OLLAMA_BASE_URL` and the model set by `OLLAMA_MODEL`. All `llama3.1`, `llama3.2:1b` and `llama3.2:latest` are supported.
- `LLM_PROVIDER=openai` uses OpenAI `gpt-4o` and requires `OPENAI_API_KEY`.
- If `LLM_PROVIDER` is empty or omitted, the application defaults to Ollama.

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

Compatible with platforms supporting Next.js 16.

## 🛠️ Development

See [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) for detailed implementation guidance.

## 📧 Support

For issues or questions, please open a GitHub issue.

---

**Built with ❤️ for cybersecurity compliance**
