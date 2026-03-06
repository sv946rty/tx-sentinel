# Sentinel Mnemonic

> **A production-ready demonstration of reasoning-first, memory-aware AI agents**

This Next.js application showcases advanced AI agent patterns including semantic memory, pronoun resolution, and transparent reasoning. Unlike typical chatbots, this agent *thinks before answering* by explicitly planning, deciding whether past context is needed, resolving pronouns correctly, and reasoning transparently in real time.

![Main UI Screenshot](docs/003.screenshots/003.reasoning.screen.png)

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

### 3. **The Semantic Similarity Problem**
**Problem:** "Who is George Washington's wife?" doesn't match "Who is George Washington's spouse?" because text search can't understand synonyms  
**Solution:** **Vector database (pgvector) with OpenAI embeddings** for semantic search. Questions are converted to 1,536-dimensional vectors where "wife" and "spouse" are mathematically close. Achieves 87.7% similarity match where text search would fail completely.

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
- **Vector database (pgvector)** with OpenAI embeddings for semantic search
- **Hybrid search strategy** - vector similarity (primary) + text search (fallback)
- **Intelligent caching** - 90% cost reduction on duplicate questions via semantic matching
- **Validation everywhere** using Zod (env vars, inputs, outputs, LLM responses)
- **PostgreSQL-only** database access via Drizzle ORM
- **Better Auth** for authentication (Google + GitHub OAuth)
- **Transparent reasoning** visible to users in real-time with search analytics
- **Optional session password protection** for demo deployments to prevent API abuse

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 16.1.3+ |
| Runtime | React | 19.2.3 |
| Database | Supabase PostgreSQL + pgvector | - |
| ORM | Drizzle | 0.45.1+ |
| Auth | Better Auth | 1.4.15+ |
| AI | OpenAI (gpt-4o + embeddings) | 6.16.0+ |
| Vector Search | pgvector | Latest |
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

5. **Enable pgvector extension** (for semantic search)

   Run in Supabase SQL Editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

6. **Run database migrations**
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

7. **(Optional) Backfill existing questions with embeddings**
   ```bash
   pnpm backfill:embeddings
   ```

8. **Configure OAuth callback URLs**

   For local development:
   - **Google:** Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs
   - **GitHub:** Set callback URL to `http://localhost:3000/api/auth/callback/github`

9. **Start the development server**
   ```bash
   pnpm dev
   ```

10. **Visit http://localhost:3000**

## 📋 Available Commands

```bash
pnpm dev                  # Start dev server
pnpm build                # Build for production
pnpm start                # Start production server
pnpm db:generate          # Generate Drizzle migrations
pnpm db:migrate           # Apply database migrations
pnpm db:test              # Test database connection
pnpm db:reset             # Reset database (DEV ONLY - destructive!)
pnpm backfill:embeddings  # Generate embeddings for existing questions
```

## 🧪 Testing the System

The repository includes **20 comprehensive test scenarios** in `/docs/002.app.docs/sample-questions.md`. Access them in the UI by clicking the "Sample Questions" link above the input box.

### Quick Test Examples

**Basic Pronoun Resolution:**
1. "Who is Tim Cook?"
2. "How old is he?"
3. "Where was he born?"

**Vector Search - Semantic Similarity:**
1. "Who is Bill Clinton's wife?"
2. "Who is Bill Clinton's spouse?" (should show 87%+ similarity)
3. "Who is he married to?" (pronoun resolution + semantic search)

**Vector Search - Synonym Detection:**
1. "How big is Yosemite National Park?"
2. "How large is Yosemite National Park?" (should show 95%+ similarity)
3. "What is the size of Yosemite?" (paraphrase detection)

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
│   │   │   ├── memory-existence-check.ts  # Vector + text hybrid search
│   │   │   ├── memory-dependency-decision.ts
│   │   │   ├── reasoning.ts
│   │   │   └── answer.ts
│   │   ├── tools/                # Agent tools
│   │   │   └── memory-retrieval.ts  # Semantic memory search
│   │   └── validation.ts         # Memory decision validation
│   ├── db/                       # Database layer
│   │   ├── schema/               # Drizzle schemas (with vector columns)
│   │   └── queries/              # Database queries
│   │       ├── agent-runs.ts     # Auto-generate embeddings
│   │       └── vector-search.ts  # Vector similarity queries
│   ├── lib/                      # Utilities
│   │   ├── env.ts                # Validated environment variables
│   │   └── embeddings.ts         # OpenAI embedding generation
│   ├── app/                      # Next.js app directory
│   └── components/               # React components
│       └── memory/
│           └── search-analytics.tsx  # Vector search UI indicator
├── docs/                         # Documentation
│   ├── 001.ai.rules/             # AI governance & development rules
│   ├── 002.app.docs/             # Application documentation
│   │   ├── features/             # Feature documentation
│   │   │   ├── QUICK_START_VECTOR.md
│   │   │   ├── VECTOR_IMPLEMENTATION_SUMMARY.md
│   │   │   └── VECTOR_SEARCH_TEST_SCENARIOS.md (27 test cases)
│   │   └── deployment/           # Deployment guides
│   │       └── ENABLE_PGVECTOR.md
│   ├── 003.screenshots/          # UI screenshots
│   └── 010.sql.scripts/          # Database scripts
├── scripts/
│   └── backfill-embeddings.ts    # Backfill script for existing data
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

### Vector-Based Semantic Search

The system uses **OpenAI embeddings + pgvector** for semantic similarity:

1. **Embedding Generation** - Each question converted to 1,536-dimensional vector using `text-embedding-3-small` ($0.02/1M tokens)
2. **Vector Search** - pgvector finds similar questions using cosine distance
3. **Hybrid Strategy** - Vector similarity (primary) + text search (fallback for records without embeddings)
4. **Smart Caching** - Questions with >= 85% similarity reuse cached answers

**Example:** "Who is his wife?" matches "Who is his spouse?" at 87.7% similarity, saving $0.03 by reusing the cached answer instead of calling GPT-4o.

**Cost Savings:** 90% reduction on duplicate questions (embedding cost: $0.00002 vs GPT-4o cost: $0.01-0.05)

### Validation Rules

- Memory existence and dependency are separate decisions
- Pronoun resolution is MANDATORY if pronouns detected
- Resolved context MUST propagate to reasoning and answer generation
- All rules enforced in `/src/agent/validation.ts`

### Vector Search Implementation

The system implements **production-grade semantic search** with pgvector:

```typescript
// 1. Embedding generation (automatic on insert)
const embeddingResult = await generateEmbedding(question)
await db.insert(agentRuns).values({
  ...data,
  questionEmbedding: embeddingResult.embedding,  // 1536 dimensions
  embeddingModel: "text-embedding-3-small"
})

// 2. Vector similarity search (cosine distance)
const vectorResults = await searchByVector(userId, question, {
  limit: 5,
  similarityThreshold: 0.75  // Adjustable threshold
})

// 3. Answer reuse logic (4 scenarios)
// Scenario 4: Trust high vector similarity (>= 85%)
if (existenceCheck.vectorSimilarityScore >= 0.85) {
  answerToReuse = existenceCheck.existingAnswer  // Save $0.03 per reuse!
}
```

**UI Integration:**
- Purple "Semantic Search" badge for vector results
- Gray "Text Search" badge for fallback
- Similarity scores displayed (e.g., "87.7% match")
- Visual indicators in reasoning timeline

**Performance:**
- Vector search: ~10-30ms
- Text search fallback: ~50-100ms
- Answer reuse: ~100ms total vs 2-5s for new generation
- **20-50x speedup on duplicate questions**

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
- **Vector Database Expertise:** pgvector implementation with semantic search
- **RAG Implementation:** Hybrid search strategy with embeddings
- **LLM Cost Optimization:** 90% reduction via intelligent caching

The system is designed to be **trustworthy, predictable, and reviewable**.

### Demonstrates Bonus Skills

✅ **Hands-on experience with agentic AI frameworks** - Explicit planning, memory, and reasoning
✅ **Familiarity with vector databases and RAG** - pgvector with OpenAI embeddings, cosine similarity search
✅ **Deploying and maintaining LLM-integrated systems** - Production deployment, cost optimization, monitoring

## 📚 Documentation

### Core Documentation
- [Overview](docs/002.app.docs/overview.md) - Complete system overview
- [Setup Guide](docs/002.app.docs/setup.md) - Detailed setup instructions
- [Sample Questions](docs/002.app.docs/sample-questions.md) - 20 test scenarios
- [App Summary](docs/002.app.docs/app.summary.md) - High-level summary

### Vector Database Documentation
- [Quick Start Guide](docs/002.app.docs/features/QUICK_START_VECTOR.md) - 5-minute setup
- [Implementation Summary](docs/002.app.docs/features/VECTOR_IMPLEMENTATION_SUMMARY.md) - Complete overview
- [Test Scenarios](docs/002.app.docs/features/VECTOR_SEARCH_TEST_SCENARIOS.md) - 27 test cases
- [Enable pgvector](docs/002.app.docs/deployment/ENABLE_PGVECTOR.md) - Deployment guide

### AI Governance
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
- OpenAI GPT-4o + text-embedding-3-small
- Supabase PostgreSQL + pgvector
- Better Auth
- shadcn/ui
- Drizzle ORM

---

**Think. Remember. Decide. Search Semantically.**
