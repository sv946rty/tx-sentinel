# Performance Checklist

This checklist is used to verify compliance with Vercel React Best Practices.

Claude Code MUST self-check against this list before completing any task.

If any item cannot be checked, Claude Code MUST explain why
and obtain approval before proceeding.

This checklist MUST be reviewed and satisfied before declaring
any phase complete.

---

## Server vs Client

- [ ] Server Components are the default
- [ ] `"use client"` is used only when necessary
- [ ] Client components are UI-only
- [ ] No business logic in client components

---

## Data Fetching

- [ ] No client-side data fetching
- [ ] Data fetched in Server Components or Server Actions
- [ ] No `useEffect` for data loading
- [ ] Data fetched as high in the tree as possible

---

## Async Behavior

- [ ] No sequential awaits when parallelization is possible
- [ ] Independent async work uses `Promise.all`
- [ ] No unnecessary blocking of render
      (e.g. avoid awaiting independent async work before render)

---

## Bundle Size

- [ ] No heavy libraries imported into client components
- [ ] Client components remain small and focused
- [ ] No accidental client boundary expansion

---

## Final Verification

- [ ] Code follows the React Performance Contract
- [ ] Changes are minimal and reviewable
- [ ] No unnecessary abstractions added
- [ ] Performance decisions are explained
