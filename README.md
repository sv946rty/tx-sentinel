# AI Agent Demo

> **A production-ready demonstration of reasoning-first, memory-aware AI agents**

This Next.js application showcases advanced AI agent patterns including semantic memory, pronoun resolution, and transparent reasoning. Unlike typical chatbots, this agent *thinks before answering* by explicitly planning, deciding whether past context is needed, resolving pronouns correctly, and reasoning transparently in real time.

![Main UI Screenshot](docs/003.screenshots/002.main-ui.screen.png)

## 🎯 What This Demonstrates

This project solves four critical problems in AI agent development:

### 1. **The Forgetful Agent Problem**
**Problem:** Users ask similar questions and the agent acts like it's never seen them before.  
**Solution:** Two-step memory process that distinguishes between:
- **Memory Existence** (UX) - "Have I seen this question before?"
- **Memory Dependency** (Reasoning) - "Do I need prior context to answer?"

### 2. **The Pronoun Confusion Problem**
**Problem:** User asks "Who is Tim Cook?" then follows with "How old is he?" and agent says "I don't know who 'he' is."  
**Solution:** Mandatory pronoun resolution that automatically resolves references using conversation history, ensuring pronouns always resolve to the most recent relevant entity.

### 3. **The Keyword-Only Similarity Problem**
**Problem:** "Who invented the telephone?" doesn't match "Who created the telephone?" because "invented" ≠ "created."  
**Solution:** Multi-strategy search with 4 fallback strategies + LLM-based similarity with generous matching for synonyms and paraphrasing.

### 4. **The Black Box Agent Problem**
**Problem:** Users don't understand what the agent is doing or why it's slow.  
**Solution:** Streaming reasoning timeline with user-facing steps showing exactly what the agent is thinking.

## 🏗️ Architecture

The system implements a **single-agent design** with explicit steps:

```
Planning → Memory Check → Dependency Decision → Pronoun Resolution → Reasoning Loop → Answer
```

### Key Features

- **Server-first architecture** with Server Components and Server Actions
- **Streaming architecture** for real-time updates
- **Validation everywhere** using Zod (env vars, inputs, outputs, LLM responses)
- **PostgreSQL-only** database access via Drizzle ORM
- **Better Auth** for authentication (Google + GitHub OAuth)
- **Semantic similarity search** with 4-strategy fallback
- **Transparent reasoning** visible to users in real-time
- **Optional session password protection** for demo deployments to prevent API abuse

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 16.1.3+ |
| Runtime | React | 19.2.3 |
| Database | Supabase PostgreSQL | - |
| ORM | Drizzle | 0.45.1+ |
| Auth | Better Auth | 1.4.15+ |
| AI | OpenAI (gpt-4o) | 6.16.0+ |
| Validation | Zod | 4.3.5+ |
| UI | shadcn/ui | Latest |
| Styling | Tailwind CSS | v4 |
| Markdown | react-markdown | 10.1.0+ |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- Supabase account
- OpenAI API key
- Google OAuth credentials (optional)
- GitHub OAuth credentials (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai-agent-demo
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```bash
   # Database Configuration
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:6543/postgres
   DATABASE_SCHEMA=ai_agent

   # Authentication (min 32 characters)
   AUTH_SECRET=generate-a-secure-random-string-at-least-32-chars
   BETTER_AUTH_URL=http://localhost:3000

   # Google OAuth (https://console.developers.google.com/)
   GOOGLE_CLIENT_ID=your-real-google-client-id
   GOOGLE_CLIENT_SECRET=your-real-google-client-secret

   # GitHub OAuth (https://github.com/settings/developers)
   GITHUB_CLIENT_ID=your-real-github-client-id
   GITHUB_CLIENT_SECRET=your-real-github-client-secret

   # OpenAI
   OPENAI_API_KEY=sk-your-real-openai-api-key

   # Session Password Protection (Optional - for demo deployment)
   REQUIRE_SESSION_PASSWORD=false
   SESSION_PASSWORD=whoami
   ```

4. **Set up the database**
   
   Run the schema creation script in your Supabase SQL Editor:
   ```sql
   CREATE SCHEMA IF NOT EXISTS ai_agent;
   GRANT USAGE ON SCHEMA ai_agent TO authenticated;
   GRANT CREATE ON SCHEMA ai_agent TO authenticated;
   ALTER ROLE authenticated SET search_path TO ai_agent, public;
   ```

5. **Run database migrations**
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

6. **Configure OAuth callback URLs**
   
   For local development:
   - **Google:** Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs
   - **GitHub:** Set callback URL to `http://localhost:3000/api/auth/callback/github`

7. **Start the development server**
   ```bash
   pnpm dev
   ```

8. **Visit http://localhost:3000**

## 📋 Available Commands

```bash
pnpm dev               # Start dev server
pnpm build             # Build for production
pnpm start             # Start production server
pnpm db:generate       # Generate Drizzle migrations
pnpm db:migrate        # Apply database migrations
pnpm db:test           # Test database connection
pnpm db:reset          # Reset database (DEV ONLY - destructive!)
```

## 🧪 Testing the System

The repository includes **20 comprehensive test scenarios** in `/docs/002.app.docs/sample-questions.md`. Access them in the UI by clicking the "Sample Questions" link above the input box.

### Quick Test Examples

**Basic Pronoun Resolution:**
1. "Who is Tim Cook?"
2. "How old is he?"
3. "Where was he born?"

**Semantic Similarity:**
1. "Where does Elon Musk live right now?"
2. "Where does he live currently?"
3. "What is his current residence?"

**Paraphrased Questions:**
1. "Who invented the telephone?"
2. "Who created the telephone?"
3. "Who is credited with inventing the telephone?"

**Memory Exists But Not Required:**
1. "What is 2 + 2?"
2. "What is 2 + 2?" (recognizes repetition but doesn't fetch memory)

See the full test suite in `/docs/002.app.docs/sample-questions.md`.

## 📁 Project Structure

```
├── src/
│   ├── agent/                    # Agent implementation
│   │   ├── orchestrator.ts       # Main agent orchestration
│   │   ├── steps/                # Agent execution steps
│   │   │   ├── memory-existence-check.ts
│   │   │   ├── memory-dependency-decision.ts
│   │   │   ├── reasoning.ts
│   │   │   └── answer.ts
│   │   └── validation.ts         # Memory decision validation
│   ├── db/                       # Database layer
│   │   ├── schema/               # Drizzle schemas
│   │   └── queries/              # Database queries
│   ├── lib/                      # Utilities
│   │   └── env.ts                # Validated environment variables
│   ├── app/                      # Next.js app directory
│   └── components/               # React components
├── docs/                         # Documentation
│   ├── 001.ai.rules/             # AI governance & development rules
│   ├── 002.app.docs/             # Application documentation
│   ├── 003.screenshots/          # UI screenshots
│   └── 010.sql.scripts/          # Database scripts
└── drizzle/                      # Generated migrations
```

## 🔑 Key Implementation Details

### Pronoun Resolution Context Propagation

The system **mandatorily** resolves pronouns and propagates resolved context through both reasoning and answer generation:

```typescript
// Build resolved context from pronoun resolution
let resolvedContext: string | undefined
if (dependencyDecision.pronounResolution?.resolved) {
  const entities = dependencyDecision.pronounResolution.resolvedEntities
    .map(e => `"${e.pronoun}" refers to "${e.resolvedTo}"`)
    .join(", ")
  resolvedContext = `The following pronouns have been resolved: ${entities}...`
}

// CRITICAL: Pass to BOTH reasoning and answer
const reasoningResult = await performReasoningLoop(
  question, plan, memories, resolvedContext  // ← HERE
)

const answerStream = await generateAnswerStream(
  question, plan, memories, thoughts, resolvedContext  // ← AND HERE
)
```

### Multi-Strategy Search

The system uses 4 fallback strategies to find similar questions:

1. **LLM-generated semantic keywords** - AI extracts meaningful concepts
2. **Meaningful words combined** - Filters stop words, combines remainder
3. **Individual keywords** - Crucial for detecting paraphrasing!
4. **Full original question** - Exact or near-exact matches

### Validation Rules

- Memory existence and dependency are separate decisions
- Pronoun resolution is MANDATORY if pronouns detected
- Resolved context MUST propagate to reasoning and answer generation
- All rules enforced in `/src/agent/validation.ts`

## 🤖 For AI Assistants (Claude Code)

If you're an AI assistant helping with this codebase, **please read these documents first:**

1. `/docs/001.ai.rules/claude_rules.md` - How to interact with this codebase
2. `/docs/001.ai.rules/react_performance_contract.md` - React patterns to follow
3. `/docs/001.ai.rules/performance_checklist.md` - Performance requirements
4. `/docs/001.ai.rules/prompts/master.prompt.v1.md` - Complete implementation reference

### Key Architectural Rules

- Server Components by default, `"use client"` only when needed
- All mutations via Server Actions
- Zod validation everywhere (no unvalidated boundaries)
- No `process.env` in app code (use `@/lib/env`)
- Better Auth IDs are `text`, not `uuid`
- Never use `public` schema (use `DATABASE_SCHEMA`)

### Common Pitfalls to Avoid

- ❌ Forgetting to pass `resolvedContext` to reasoning AND answer
- ❌ Using simple substring search instead of multi-strategy fallback
- ❌ Conflating memory existence with memory dependency
- ❌ Not exporting new functions from `index.ts` files
- ❌ State updates during render (use `useEffect`)

## 🎓 What This Project Demonstrates

This is an **interview-level demonstration** showcasing:

- **Senior Engineering:** Clean code, proper patterns, thoughtful architecture
- **Director-Level Thinking:** Separation of UX concerns from computational needs
- **Production Readiness:** Validation, error handling, security best practices
- **Transparency:** User-facing reasoning, not hidden magic

The system is designed to be **trustworthy, predictable, and reviewable**.

## 📚 Documentation

- [Overview](docs/002.app.docs/overview.md) - Complete system overview
- [Setup Guide](docs/002.app.docs/setup.md) - Detailed setup instructions
- [Sample Questions](docs/002.app.docs/sample-questions.md) - 20 test scenarios
- [App Summary](docs/002.app.docs/app.summary.md) - High-level summary
- [AI Rules](docs/001.ai.rules/README.md) - AI governance documentation

## 🔒 Security & Best Practices

- All environment variables validated with Zod schemas
- Server-first architecture minimizes client-side attack surface
- OAuth authentication via Better Auth
- PostgreSQL parameterized queries prevent SQL injection
- No sensitive data in logs or client-side code

### Session Password Protection (Optional)

For public demo deployments to prevent abuse and excessive API costs, the app supports optional session-based password protection:

**How it works:**
1. First-time users are prompted to enter a password before submitting questions
2. Password is verified server-side against `SESSION_PASSWORD` environment variable
3. Once authenticated, the session is marked and no further prompts appear
4. Authentication persists for the entire user session

**Configuration:**

For **development** (no password protection):
```bash
REQUIRE_SESSION_PASSWORD=false
# or simply omit both variables
```

For **production/demo deployment** (Vercel, etc.):
```bash
REQUIRE_SESSION_PASSWORD=true
SESSION_PASSWORD=your-secure-password-here
```

**Security features:**
- Password verification happens server-side only (never exposed to client)
- Authentication state stored in database session table (tied to Better Auth session lifecycle)
- One-time verification per session (no repeated prompts)
- When user logs out and logs back in, they must enter password again (new session)
- Feature can be completely disabled via environment variable

## 🤝 Contributing

This is a demonstration project. If you're using this as a reference:

1. Review the AI governance documents in `/docs/001.ai.rules/`
2. Follow the React performance contract
3. Maintain the validation-everywhere pattern
4. Keep the agent steps explicit and transparent

## 📄 License

[Your License Here]

## 🙏 Acknowledgments

Built with:
- Next.js 16 (App Router)
- OpenAI GPT-4o
- Supabase PostgreSQL
- Better Auth
- shadcn/ui
- Drizzle ORM

---

**Think. Remember. Decide.**
