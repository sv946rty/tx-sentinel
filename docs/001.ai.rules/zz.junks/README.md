# 🤖 AI Governance

This repository uses **AI (Claude Code)** as an implementation assistant, not as an autonomous system.

All AI-generated code is governed by explicit, repo-local contracts to ensure predictability, performance, and reviewability. These rules are treated as part of the codebase and apply equally to human and AI contributors.

---

## 📜 Governing Documents

AI behavior in this repository is constrained by the following documents:

### [REACT_PERFORMANCE_CONTRACT.md](docs/REACT_PERFORMANCE_CONTRACT.md)

- Enforces performance and architectural rules derived from **Vercel React Best Practices**.
- Authoritative source for server/client boundaries, data fetching, and async behavior.

### [CLAUDE_RULES.md](docs/CLAUDE_RULES.md)

- Defines behavioral constraints for Claude Code.
- Focuses on scope discipline, minimal diffs, and phase-based execution.

### [PERFORMANCE_CHECKLIST.md](docs/PERFORMANCE_CHECKLIST.md)

- A **mandatory** self-audit checklist.
- Must be satisfied before any phase or task is considered complete.

---

## ⚙️ Design Principles

- **Explicit & Versioned:** AI behavior is explicit, versioned, and reviewable.
- **Design-Time Performance:** Performance is enforced at design time, not retrofitted.
- **Server-First:** Server-first architecture is the default.
- **Minimal Client Footprint:** Client-side JavaScript is minimized intentionally.
- **Senior Review:** All AI-generated code is assumed to be reviewed by a senior engineer.

---

## 💡 Why This Exists

AI systems are powerful but non-deterministic. By codifying constraints locally in the repository, we ensure that:

1.  **Predictability:** AI behavior is predictable and explainable.
2.  **Intentionality:** Architectural decisions are intentional.
3.  **Code Quality:** Quality does not depend on implicit model behavior or hidden memory.
4.  **Auditability:** The system remains auditable by humans.
5.  **Standardization:** AI follows the same rules as human contributors.

---

## 📋 Summary

> This repository treats AI as a **constrained contributor** governed by explicit contracts, not as an autonomous agent.
