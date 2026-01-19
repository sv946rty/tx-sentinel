# AI Agent Demo - Project Overview

## What This Project Is

A **production-ready demonstration** of advanced AI agent patterns, specifically showcasing:

1. **Memory Existence vs. Memory Dependency Separation** - Distinguishing between "have I seen this question before?" (UX) and "do I need prior context to answer?" (reasoning)
2. **Mandatory Pronoun Resolution** - Automatic resolution of pronouns and implicit references using conversation history
3. **Semantic Similarity Detection** - Recognizing paraphrased questions and synonyms, not just exact matches
4. **Transparent Reasoning** - User-facing timeline showing what the agent is doing and why
5. **Explicit Agent Architecture** - All agent logic implemented directly in application code, not hidden in abstractions

## Problems This Solves

### 1. **The Forgetful Agent Problem**
**Problem:** Users ask similar questions and the agent acts like it's never seen them before.
**Solution:** Two-step memory process - acknowledge similar questions even when prior context isn't needed for reasoning.

### 2. **The Pronoun Confusion Problem**
**Problem:** User asks "Who is Tim Cook?" then follows with "How old is he?" and agent says "I don't know who 'he' is."
**Solution:** Mandatory pronoun resolution that automatically resolves references using recent conversation history and propagates context through reasoning and answer generation.

### 3. **The Keyword-Only Similarity Problem**
**Problem:** "Who invented the telephone?" doesn't match "Who created the telephone?" because "invented" ≠ "created."
**Solution:** Multi-strategy search (4 fallback strategies) + LLM-based similarity with generous matching criteria for synonyms and paraphrasing.

### 4. **The Black Box Agent Problem**
**Problem:** Users don't understand what the agent is doing or why it's slow.
**Solution:** Streaming reasoning timeline with user-facing steps (not raw chain-of-thought).

## Architecture Highlights

- **Single-agent design** with explicit steps: Planning → Memory Check → Dependency Decision → Pronoun Resolution → Reasoning Loop → Answer
- **Server-first** with Server Components and Server Actions
- **Streaming architecture** for real-time updates
- **Validation everywhere** using Zod (env vars, inputs, outputs, LLM responses)
- **PostgreSQL-only** database access (no Supabase HTTP APIs)
- **Better Auth** for authentication (Google + GitHub)

## Tech Stack

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

## Key Files

### Agent Implementation
- `/src/agent/orchestrator.ts` - Main agent orchestration
- `/src/agent/steps/memory-existence-check.ts` - 4-strategy search for similar questions
- `/src/agent/steps/memory-dependency-decision.ts` - Mandatory pronoun resolution
- `/src/agent/steps/reasoning.ts` - Iterative reasoning with context propagation
- `/src/agent/steps/answer.ts` - Answer generation with resolved context
- `/src/agent/validation.ts` - Memory decision validation rules

### Database
- `/src/db/schema/agent-runs.ts` - Database schema with JSONB for complex types
- `/src/db/queries/agent-runs.ts` - All database queries (search, list, delete)

### Documentation
- `/docs/ai/prompts/master.prompt.v1.md` - **Complete implementation guide**
- `/docs/ai/claude_rules.md` - Claude Code interaction rules
- `/docs/ai/react_performance_contract.md` - React performance patterns
- `/docs/ai/performance_checklist.md` - Performance verification
- `/docs/sample-questions.md` - **20 test scenarios** for all features

## Testing the System

### Sample Test Scenarios

See `/docs/sample-questions.md` for 20 comprehensive test scenarios. Key tests:

1. **Basic Pronoun Resolution**: "Who is Tim Cook?" → "How old is he?"
2. **Semantic Similarity**: "Where does he live right now?" → "Where does he live currently?"
3. **Paraphrased Questions**: "Who invented the telephone?" → "Who created the telephone?"
4. **Context Switching**: Ask about Sundar Pichai, then Satya Nadella - pronouns switch correctly
5. **Memory Exists But Not Required**: "What is 2 + 2?" asked twice - acknowledges repetition but doesn't retrieve memory

### In-App Testing
- Click **"Sample Questions"** link above input box for quick access to test scenarios
- Click **"Clear All Questions"** in sidebar to start fresh

## Critical Implementation Details

### 1. Pronoun Resolution Context Propagation
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

### 2. Multi-Strategy Search
```typescript
// Strategy 1: LLM-generated semantic keywords
// Strategy 2: Meaningful words combined
// Strategy 3: Individual keywords (crucial for paraphrasing!)
// Strategy 4: Full original question
```

### 3. Validation Rules
- Memory existence and dependency are separate decisions
- Pronoun resolution is MANDATORY if pronouns detected
- Resolved context MUST propagate to reasoning and answer
- See `/src/agent/validation.ts` for all rules

## Environment Setup

Required variables (see `.env.example`):
```bash
DATABASE_URL="postgresql://..."
DATABASE_SCHEMA="ai_agent"
AUTH_SECRET="..."
OPENAI_API_KEY="sk-..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000"
```

## Development Commands

```bash
pnpm install           # Install dependencies
pnpm dev               # Start dev server
pnpm build             # Build for production
pnpm db:generate       # Generate migrations
pnpm db:migrate        # Apply migrations
pnpm db:test           # Test database connection
pnpm db:reset          # Reset database (DEV ONLY)
```

## For Claude Code Agents

When helping with this repo:

1. **Read these docs first**:
   - `/docs/ai/claude_rules.md` - How to interact with this codebase
   - `/docs/ai/react_performance_contract.md` - React patterns to follow
   - `/docs/ai/performance_checklist.md` - Performance requirements
   - `/docs/ai/prompts/master.prompt.v1.md` - Complete implementation reference

2. **Key architectural rules**:
   - Server Components by default, `"use client"` only when needed
   - All mutations via Server Actions
   - Zod validation everywhere (no unvalidated boundaries)
   - No `process.env` in app code (use `@/lib/env`)
   - Better Auth IDs are `text`, not `uuid`
   - Never use `public` schema (use `DATABASE_SCHEMA`)

3. **Common pitfalls to avoid**:
   - Forgetting to pass `resolvedContext` to reasoning AND answer
   - Using simple substring search instead of multi-strategy fallback
   - Conflating memory existence with memory dependency
   - Not exporting new functions from `index.ts` files
   - State updates during render (use `useEffect`)

4. **Testing approach**:
   - Use `/docs/sample-questions.md` scenarios
   - Check reasoning timeline for proper memory decisions
   - Verify pronouns are resolved in final answers
   - Test paraphrased questions (biggest failure point!)

## Project Goals

This is an **interview-level demonstration** showcasing:
- Senior engineering: Clean code, proper patterns, thoughtful architecture
- Director-level thinking: Separation of UX concerns from computational needs
- Production readiness: Validation, error handling, security
- Transparency: User-facing reasoning, not hidden magic

The system is designed to be **trustworthy, predictable, and reviewable**.
