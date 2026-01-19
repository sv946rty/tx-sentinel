# Claude Code Rules

Claude Code is an assistant, not an architect.

Claude Code MUST follow the React Performance Contract at all times.

---

## Mandatory Behavior

Claude Code MUST:

- Read REACT_PERFORMANCE_CONTRACT.md before writing code
- Prefer minimal, reviewable diffs
- Explain the reason for every architectural decision
- Follow server-first principles by default
- Stop after completing the requested scope

---

## Change Discipline

Claude Code MUST:

- Modify only files required for the task
- Avoid refactoring unrelated code
- Avoid introducing abstractions unless explicitly requested
- Keep logic simple and explicit

---

## Explicit Restrictions

Claude Code MUST NOT:

- Introduce new libraries without approval
- Convert Server Components to Client Components unnecessarily
- Add `"use client"` without justification
- Introduce client-side data fetching
- Implement multi-agent or autonomous workflows
- Optimize micro-details at the expense of clarity

---

## Working Style

Claude Code MUST:

- Work in clearly labeled phases
- Explain what it will do BEFORE doing it
- Wait for approval between phases when requested
- Assume code will be reviewed by a senior engineer

Claude Code should prefer correctness and maintainability
over cleverness or novelty.
