# AI Agent Demo - System Overview

**Last Updated:** 2026-01-19
**Version:** 1.1

---

## What This System Does

This is a **single-agent AI demo** that demonstrates advanced memory and context-aware capabilities:

1. **Explicit Planning** - Creates a step-by-step plan before executing
2. **Memory System** - PostgreSQL-backed memory with semantic search
3. **Pronoun Resolution** - Automatically resolves "he", "she", "it" using conversation history
4. **Transparent Reasoning** - Shows each step in real-time
5. **Streamed Answers** - Progressive answer generation with markdown formatting

---

## Core Architecture

### Agent Pipeline Flow

```
User Question
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│  1. PLANNING                                                │
│     - Analyze question                                      │
│     - Create execution plan                                 │
│     - Determine if memory might be needed                   │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│  2. MEMORY EXISTENCE CHECK                                  │
│     - Multi-strategy search (4 strategies)                  │
│     - Semantic similarity detection                         │
│     - LLM-powered similarity judgment                       │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│  3. MEMORY DEPENDENCY DECISION (with Pronoun Resolution)    │
│     - Detect pronouns (he, she, it, they, this, that...)    │
│     - Resolve to MOST RECENT entity                         │
│     - Determine if memory is REQUIRED for reasoning         │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│  4. MEMORY RETRIEVAL (if needed)                            │
│     - Retrieve relevant past Q&A pairs                      │
│     - Build context for reasoning                           │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│  5. REASONING LOOP                                          │
│     - Iterative reasoning (minimum 1 iteration)             │
│     - Uses resolved pronoun context                         │
│     - Uses retrieved memories                               │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│  6. ANSWER GENERATION                                       │
│     - Streaming response                                    │
│     - Markdown formatting                                   │
│     - Uses resolved context throughout                      │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
 Final Answer (streamed to UI)
```

---

## Key Features

### 1. Pronoun Resolution

The system automatically detects and resolves pronouns using conversation history:

**Supported References:**
- Pronouns: he, she, it, they, him, her, them, his, hers, their, theirs
- Demonstratives: this, that, these, those
- Implicit references: "the person", "the company", "the project"

**Critical Rule: Most Recent Entity Wins**

The system ALWAYS resolves pronouns to the MOST RECENT relevant entity:

```
User: "Who is Elon Musk?"
User: "How old is he?"

Result: "he" → "Elon Musk" (most recent entity)
```

Even if there's older history about other people (like "Tim Cook"), the system will use the most recent entity.

### 2. Semantic Similarity Detection

The memory system uses multi-strategy search to find similar questions:

1. **Strategy 1:** LLM-generated semantic keywords
2. **Strategy 2:** All meaningful words combined
3. **Strategy 3:** Individual keyword searches (crucial for paraphrases)
4. **Strategy 4:** Full original question

**Similarity Examples:**
- "right now" ≈ "currently" (synonyms)
- "invented" ≈ "created" (synonyms)
- "Where was he born?" ≈ "What is his birthplace?" (paraphrase)

### 3. Memory Existence vs. Dependency

The system separates two concepts:

| Concept | Meaning |
|---------|---------|
| **Memory Existence** | Has a similar question been asked before? |
| **Memory Dependency** | Is prior context REQUIRED to answer correctly? |

**Example:**
- Q: "What is 2 + 2?" (asked twice)
- Memory Existence: TRUE (identical question found)
- Memory Dependency: FALSE (self-contained, doesn't need prior context)

---

## UI Components

### Modern AI-Themed Design

The UI uses a professional AI-themed design with:

- **Gradient Header** (`ai-header`): Purple to blue gradient
- **Mesh Background** (`bg-ai-mesh`): Subtle radial gradients
- **Glass Cards** (`ai-card`): Backdrop blur with semi-transparent backgrounds
- **Gradient Buttons** (`gradient-primary`): Purple to blue CTAs
- **Animated Elements**: Pulsing indicators, gradient text

### Component Layout

```
┌─────────────────────────────────────────────────────────────┐
│  AI Header (gradient)                                       │
│  [Logo] AI Agent Demo                    [Theme] [Avatar]   │
├─────────────┬───────────────────────────────────────────────┤
│  Sidebar    │  Main Content (bg-ai-mesh)                    │
│  (ai-sidebar│                                               │
│             │  ┌─────────────────────────────────────────┐  │
│  Memory     │  │  Question Display (ai-card)             │  │
│  Panel      │  └─────────────────────────────────────────┘  │
│             │                                               │
│  - Search   │  ┌─────────────────────────────────────────┐  │
│  - History  │  │  Reasoning Timeline (ai-card)           │  │
│  - Delete   │  │  [Brain icon] Thinking...               │  │
│             │  └─────────────────────────────────────────┘  │
│             │                                               │
│             │  ┌─────────────────────────────────────────┐  │
│             │  │  Answer Display (ai-card)               │  │
│             │  │  [Sparkles icon] Generating...          │  │
│             │  └─────────────────────────────────────────┘  │
│             │                                               │
│             │  ┌─────────────────────────────────────────┐  │
│             │  │  Question Input (ai-card)               │  │
│             │  │  [Textarea]              [Send Button]  │  │
│             │  └─────────────────────────────────────────┘  │
└─────────────┴───────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16.1.3+ (App Router) |
| **Database** | Supabase PostgreSQL (direct connection) |
| **Auth** | Better Auth (Google + GitHub) |
| **AI Provider** | OpenAI API (gpt-4o) |
| **ORM** | Drizzle ORM |
| **UI** | shadcn/ui + Tailwind CSS v4 |
| **Validation** | Zod 4.3.5+ |

---

## Recent Updates (2026-01-19)

### Bug Fix: Pronoun Resolution Priority

**Issue:** When a user asked "Who is Elon Musk?" followed by "How old is he?", the system incorrectly resolved "he" to "Tim Cook" from older conversation history.

**Fix:** Updated the pronoun resolution prompt in `memory-dependency-decision.ts` to:

1. Explicitly label the array as `recentQuestions_ORDERED_MOST_RECENT_FIRST`
2. Add `recencyRank` field to each question (0 = most recent)
3. Strongly instruct the LLM to ALWAYS look at index 0 FIRST
4. Add explicit examples showing correct resolution behavior

### UI Enhancements

1. **AI-Themed Gradients**: Added purple-to-blue gradients throughout
2. **Glass Morphism**: Updated cards with backdrop blur effects
3. **Professional Styling**: Mesh backgrounds, gradient text, animated indicators
4. **Consistent Icons**: Brain for reasoning, Sparkles for answers, History for memory

---

## File Structure

```
src/
├── agent/
│   ├── orchestrator.ts          # Main agent orchestration
│   ├── validation.ts            # Memory decision validation
│   └── steps/
│       ├── planning.ts          # Plan generation
│       ├── memory-existence-check.ts
│       ├── memory-dependency-decision.ts  # Pronoun resolution
│       ├── reasoning.ts         # Iterative reasoning
│       └── answer.ts            # Answer generation
├── components/
│   ├── agent/
│   │   ├── agent-panel.tsx      # Main interaction area
│   │   ├── question-form.tsx    # Input form
│   │   ├── reasoning-timeline.tsx
│   │   ├── answer-display.tsx
│   │   └── sample-questions-dialog.tsx
│   ├── memory/
│   │   ├── memory-panel.tsx     # Sidebar memory list
│   │   └── memory-list-item.tsx
│   └── layout/
│       ├── app-header.tsx       # Gradient header
│       └── app-shell.tsx        # Layout wrapper
├── db/
│   └── queries/
│       └── agent-runs.ts        # Database queries
└── lib/
    ├── schemas/
    │   └── agent.ts             # Zod schemas
    └── openai.ts                # OpenAI configuration
```

---

## Testing

See `/docs/sample-questions.md` for comprehensive test scenarios including:

- Basic pronoun resolution
- **Most recent entity resolution** (Test Scenario 6a)
- Semantic similarity detection
- Context switching
- Memory persistence

---

## Related Documentation

- `/docs/ai/prompts/master.prompt.v1.md` - Complete implementation guide
- `/docs/sample-questions.md` - Test scenarios
- `/docs/ai/react_performance_contract.md` - React best practices
- `/docs/ai/claude_rules.md` - Claude coding rules
