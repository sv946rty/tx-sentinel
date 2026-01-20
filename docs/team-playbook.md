# Team Playbook - AI Agent Project

## Onboarding New Developers

### Day 1: Understanding the Architecture
- Read `/docs/002.app.docs/overview.md`
- Review agent pipeline diagram
- Understand memory vs. dependency separation

### Week 1: Code Walkthrough
- `/src/agent/orchestrator.ts` - main flow
- `/src/agent/validation.ts` - safety contracts
- Run test scenarios from sample-questions.md

### Month 1: First Contribution
- Add new test scenario
- Improve one validation rule
- Document one edge case

## Code Review Standards

### Required Before Merge
- [ ] Zod validation at all boundaries
- [ ] Error handling for LLM calls
- [ ] Context propagation tested
- [ ] Documentation updated

### Review Checklist
- Does this maintain type safety?
- Is context propagated correctly?
- Are errors handled gracefully?
- Is the reasoning timeline updated?

## Architecture Decision Records

### ADR-001: Why Explicit Pronoun Resolution
**Context:** OpenAI can often handle pronouns  
**Decision:** Enforce explicit resolution anyway  
**Rationale:** Reliability > capability for production  

### ADR-002: Memory Existence vs. Dependency
**Context:** Most systems conflate these  
**Decision:** Separate into two decisions  
**Rationale:** Prevents over-retrieval and under-retrieval