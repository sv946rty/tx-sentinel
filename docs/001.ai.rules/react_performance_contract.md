# React Performance Contract

This repository enforces Vercel React Best Practices.

Reference (for context only):
https://vercel.com/blog/introducing-react-best-practices

IMPORTANT:

- This document is the authoritative contract.
- The external link is provided for background and attribution only.
- Claude Code MUST follow the rules defined in THIS file,
  even if the external article changes or contains additional guidance.
- If there is any ambiguity, Claude Code MUST choose the option
  that minimizes client JavaScript and avoids async waterfalls.

Performance is a design-time decision, not a refactor.

This contract applies to ALL code written by humans and by Claude Code.

---

## Core Principles

1. Server-first by default
2. Parallel data fetching
3. Minimal client-side JavaScript
4. Explicit client/server boundaries
5. No async waterfalls

---

## Default Rules

- React Server Components are the default
- `"use client"` is opt-in and must be justified
- Data fetching happens in Server Components or Server Actions
- Client components receive data via props
- Server Actions are preferred for mutations
- Async work must be parallelized whenever possible

---

## CRITICAL Rules (Must Never Be Violated)

### 1. No Async Waterfalls

- Do NOT `await` sequentially when work can be parallelized
- Use `Promise.all` for independent async calls
- Fetch data as high in the tree as possible

### 2. Minimize Client Bundles

- Avoid `"use client"` unless strictly necessary
- Do NOT import heavy libraries into client components
- Client components must be small and UI-focused

### 3. Server-First Rendering

- Prefer Server Components over Client Components
- Prefer server-side data fetching over client-side fetching
- No `useEffect` for data loading

---

## Allowed Client Responsibilities

Client Components MAY:

- Handle user interactions (forms, buttons, toggles)
- Manage local UI state
- Trigger Server Actions

Client Components MUST NOT:

- Fetch data
- Contain business logic
- Orchestrate workflows

---

## Disallowed Patterns

- Client-side `fetch()` for application data
- Data fetching in deeply nested components
- Implicit client boundaries
- Global client-side stores unless explicitly required
- Performance optimizations that reduce clarity

---

## Enforcement Priority

CRITICAL:

- Async waterfalls
- Server vs client misuse
- Client bundle size

IMPORTANT:

- Re-render reduction
- Suspense boundaries
- Rendering order

This contract overrides stylistic preferences.
Correctness and performance come before aesthetics.
