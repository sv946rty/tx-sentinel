# Vector Search Test Scenarios - Comprehensive Testing Suite

## Overview

This document contains 25+ test scenarios to validate vector search functionality and demonstrate RAG capabilities for interview purposes.

**Testing Approach:**
1. Run each scenario in order
2. Verify similarity scores and cached answers
3. Document results for interview demo
4. Expected similarity thresholds:
   - **0.95-1.00:** Near-identical (should reuse answer)
   - **0.85-0.94:** Very similar (should reuse answer)
   - **0.70-0.84:** Somewhat similar (may retrieve as context)
   - **<0.70:** Different topics (should not match)

---

## Category 1: Synonym Matching (Basic)

### Test 1.1: Wife vs Spouse
**Purpose:** Validate basic synonym detection

1. **Q1:** "Who is Bill Clinton's wife?"
   - Expected: Generate new answer
   - Store: "Hillary Clinton..."

2. **Q2:** "Who is Bill Clinton's spouse?"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.90-0.95

3. **Q3:** "Who is Bill Clinton's partner?"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.85-0.92

4. **Q4:** "Tell me about Bill Clinton's marriage"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.80-0.88

**Why This Matters:** Demonstrates semantic understanding beyond exact word matching.

---

### Test 1.2: Size Synonyms
**Purpose:** Validate adjective similarity

1. **Q1:** "How big is Yosemite National Park?"
   - Expected: Generate new answer
   - Store: "Yosemite is approximately 750,000 acres..."

2. **Q2:** "How large is Yosemite National Park?"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.92-0.97

3. **Q3:** "What's the size of Yosemite National Park?"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.88-0.95

4. **Q4:** "How huge is Yosemite?"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.85-0.90

**Why This Matters:** Shows understanding of descriptive adjectives.

---

### Test 1.3: Action Verbs
**Purpose:** Validate verb synonym matching

1. **Q1:** "How do I purchase a Tesla?"
   - Expected: Generate new answer

2. **Q2:** "How do I buy a Tesla?"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.93-0.98

3. **Q3:** "How can I acquire a Tesla?"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.88-0.94

4. **Q4:** "What's the process to get a Tesla?"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.85-0.92

**Why This Matters:** Demonstrates action word understanding.

---

## Category 2: Paraphrasing Detection

### Test 2.1: Question Structure Variation
**Purpose:** Validate rephrased questions

1. **Q1:** "What is the capital of France?"
   - Expected: Generate new answer
   - Store: "Paris is the capital of France..."

2. **Q2:** "Which city is the capital of France?"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.90-0.96

3. **Q3:** "France's capital is which city?"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.87-0.93

4. **Q4:** "Tell me the capital city of France"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.88-0.94

**Why This Matters:** Shows grammar/structure variation handling.

---

### Test 2.2: Formal vs Casual Language
**Purpose:** Validate tone variation detection

1. **Q1:** "What is TypeScript?"
   - Expected: Generate new answer

2. **Q2:** "Can you explain TypeScript?"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.88-0.94

3. **Q3:** "Tell me about TypeScript"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.87-0.93

4. **Q4:** "What's TS all about?"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.82-0.89

**Why This Matters:** Demonstrates formality invariance.

---

### Test 2.3: Abbreviated vs Full Forms
**Purpose:** Validate abbreviation understanding

1. **Q1:** "What does NASA do?"
   - Expected: Generate new answer

2. **Q2:** "What does the National Aeronautics and Space Administration do?"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.85-0.92

3. **Q3:** "Tell me about NASA's work"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.86-0.93

4. **Q4:** "What are NASA's responsibilities?"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.84-0.91

**Why This Matters:** Shows acronym/abbreviation handling.

---

## Category 3: Contextual Similarity

### Test 3.1: Related Concepts
**Purpose:** Validate semantic closeness vs exact match

1. **Q1:** "What is artificial intelligence?"
   - Expected: Generate new answer

2. **Q2:** "What is machine learning?"
   - Expected: Generate new answer (different concept)
   - Similarity to Q1: ~0.75-0.85 (similar but distinct)

3. **Q3:** "Explain AI to me"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.88-0.95

4. **Q4:** "What does AI mean?"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.90-0.96

**Why This Matters:** Tests threshold calibration (similar ≠ identical).

---

### Test 3.2: Temporal Variations
**Purpose:** Validate time-related question matching

1. **Q1:** "When did World War 2 end?"
   - Expected: Generate new answer

2. **Q2:** "What year did World War 2 finish?"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.88-0.94

3. **Q3:** "When was the conclusion of WW2?"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.85-0.92

4. **Q4:** "In what year did the Second World War terminate?"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.83-0.90

**Why This Matters:** Shows temporal language understanding.

---

### Test 3.3: Quantitative Variations
**Purpose:** Validate numeric question matching

1. **Q1:** "How many people live in Tokyo?"
   - Expected: Generate new answer

2. **Q2:** "What's Tokyo's population?"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.87-0.94

3. **Q3:** "How populous is Tokyo?"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.85-0.92

4. **Q4:** "What is the number of residents in Tokyo?"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.86-0.93

**Why This Matters:** Demonstrates quantitative language handling.

---

## Category 4: Pronoun Resolution + Vector Search

### Test 4.1: Combined Pronoun + Synonym
**Purpose:** Test vector search with resolved pronouns

1. **Q1:** "Who is Elon Musk?"
   - Expected: Generate new answer

2. **Q2:** "Who is his wife?"
   - Expected: Generate new answer (pronoun resolution)
   - Resolved: "Who is Elon Musk's wife?"

3. **Q3:** "Who is his spouse?"
   - Expected: Reuse Q2 answer (vector finds "wife")
   - Similarity: ~0.90-0.95

4. **Q4:** "Who is he married to?"
   - Expected: Reuse Q2 answer
   - Similarity: ~0.87-0.93

**Why This Matters:** Tests pronoun resolution + semantic search integration.

---

### Test 4.2: Nested Reference Resolution
**Purpose:** Complex pronoun chains

1. **Q1:** "What is the capital of Japan?"
   - Expected: Generate new answer

2. **Q2:** "How big is it?"
   - Expected: Generate new answer
   - Resolved: "How big is Tokyo?"

3. **Q3:** "What's its size?"
   - Expected: Reuse Q2 answer
   - Similarity: ~0.88-0.94

4. **Q4:** "How large is that city?"
   - Expected: Reuse Q2 answer
   - Similarity: ~0.85-0.91

**Why This Matters:** Shows complex reference resolution.

---

## Category 5: Edge Cases & Negative Tests

### Test 5.1: Similar Words, Different Meaning
**Purpose:** Validate semantic precision

1. **Q1:** "What is a Java programming language?"
   - Expected: Generate new answer

2. **Q2:** "What is Java the island?"
   - Expected: Generate new answer (different topic)
   - Similarity to Q1: ~0.60-0.75 (word overlap but different)

3. **Q3:** "Tell me about the Java programming language"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.92-0.98

**Why This Matters:** Tests disambiguation capability.

---

### Test 5.2: Typos & Misspellings
**Purpose:** Validate robustness to spelling errors

1. **Q1:** "What is TypeScript?"
   - Expected: Generate new answer

2. **Q2:** "What is Typscript?"
   - Expected: Reuse Q1 answer (embeddings handle typos)
   - Similarity: ~0.85-0.92

3. **Q3:** "Whta is TypeScirpt?"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.82-0.90

**Why This Matters:** Shows real-world error tolerance.

---

### Test 5.3: Different Language Style
**Purpose:** Technical vs casual language

1. **Q1:** "Explain quantum computing"
   - Expected: Generate new answer

2. **Q2:** "What is quantum computing?"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.90-0.96

3. **Q3:** "ELI5 quantum computing"
   - Expected: Reuse Q1 answer (context shows same intent)
   - Similarity: ~0.80-0.88

**Why This Matters:** Demonstrates style invariance.

---

## Category 6: Cross-Domain Testing

### Test 6.1: People vs Places
**Purpose:** Validate topic separation

1. **Q1:** "Who is Paris Hilton?"
   - Expected: Generate new answer

2. **Q2:** "What is Paris?"
   - Expected: Generate new answer (different topic)
   - Similarity: <0.70 (different domains)

3. **Q3:** "Tell me about Paris Hilton"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.90-0.96

**Why This Matters:** Tests entity type disambiguation.

---

### Test 6.2: Products vs Concepts
**Purpose:** Concrete vs abstract distinction

1. **Q1:** "What is an iPhone?"
   - Expected: Generate new answer

2. **Q2:** "What is Apple's smartphone?"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.87-0.94

3. **Q3:** "What is mobile computing?"
   - Expected: Generate new answer (broader concept)
   - Similarity: ~0.65-0.78

**Why This Matters:** Shows abstraction level handling.

---

## Category 7: Multi-Step Reasoning

### Test 7.1: Follow-up Questions
**Purpose:** Sequential question dependency

1. **Q1:** "What is React?"
   - Expected: Generate new answer

2. **Q2:** "What are its advantages?"
   - Expected: Generate new answer (requires Q1 context)
   - Resolved: "What are React's advantages?"

3. **Q3:** "What are the benefits of React?"
   - Expected: Reuse Q2 answer
   - Similarity: ~0.88-0.95

4. **Q4:** "Why use React?"
   - Expected: Reuse Q2 answer
   - Similarity: ~0.85-0.92

**Why This Matters:** Tests conversational flow + vector search.

---

### Test 7.2: Comparison Questions
**Purpose:** Comparative language patterns

1. **Q1:** "React vs Vue - which is better?"
   - Expected: Generate new answer

2. **Q2:** "Compare React and Vue"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.90-0.96

3. **Q3:** "React or Vue - what should I choose?"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.87-0.94

4. **Q4:** "Differences between React and Vue"
   - Expected: Reuse Q1 answer
   - Similarity: ~0.85-0.92

**Why This Matters:** Shows comparative structure understanding.

---

## Category 8: Interview Showcase Scenarios

### Test 8.1: Cost Savings Demo
**Purpose:** Demonstrate ROI with concrete example

**Scenario:** Ask the same question 5 different ways

1. "What is the population of New York City?"
2. "How many people live in NYC?"
3. "What's New York's population?"
4. "Tell me NYC's population count"
5. "How populous is New York City?"

**Expected Results:**
- Question 1: Full GPT-4o call (~$0.03)
- Questions 2-5: Embedding only (~$0.00002 × 4 = ~$0.00008)
- **Total Saved:** ~$0.12 (99.7% reduction)

**Interview Talking Point:**
"In this example, I asked the same question 5 different ways. Without vector search, that's 5 full API calls costing $0.15. With vector search, it's 1 API call + 4 embedding lookups costing $0.03. That's an 80% cost reduction on just 5 questions."

---

### Test 8.2: User Experience Improvement
**Purpose:** Show UX benefits

**Scenario:** New user unfamiliar with terminology

1. "What is React?"
2. User thinks: "Hmm, didn't I just ask about this differently?"
3. "Tell me about React"
4. **Result:** Instant answer (cached) vs waiting for new generation

**Interview Talking Point:**
"Vector search doesn't just save costs - it improves UX. When a user rephrases a question, they get instant responses instead of watching the AI 'think' again. This feels more like talking to someone who remembers what you asked."

---

### Test 8.3: Real-World Paraphrasing
**Purpose:** Authentic conversation flow

**Scenario:** User asking about a topic they're learning

1. "What is machine learning?"
2. [reads answer]
3. "Can you explain ML to me?"
4. [wants simpler explanation]
5. "What does machine learning mean in simple terms?"

**Expected Results:**
- Q1: Generate answer
- Q2: Reuse Q1 (abbreviation + synonym)
- Q3: Generate new answer (different framing: "simple terms")

**Interview Talking Point:**
"Notice that Q2 reused the answer because it's semantically identical, but Q3 generated a new answer because the user asked for a 'simple' explanation. This shows the system understands nuance - it's not just matching keywords."

---

## Testing Checklist

After implementation, verify:

- [ ] All Category 1 tests pass (synonym matching)
- [ ] All Category 2 tests pass (paraphrasing)
- [ ] All Category 3 tests pass (contextual similarity)
- [ ] All Category 4 tests pass (pronoun + vector combo)
- [ ] All Category 5 tests pass (edge cases)
- [ ] All Category 6 tests pass (cross-domain)
- [ ] All Category 7 tests pass (multi-step)
- [ ] All Category 8 tests demonstrate interview value

**Total Test Cases:** 27 scenarios covering 60+ individual questions

---

## Similarity Score Documentation Template

For each test, document:

```markdown
### Test X.Y: [Name]

**Question 1:** "[Original question]"
- Generated Answer: Yes
- Embedding Created: Yes
- Stored in DB: Yes

**Question 2:** "[Variant question]"
- Similarity Score: 0.XX
- Answer Reused: Yes/No
- Search Method: vector_similarity
- Latency: XXXms (vs YYYYms for new generation)

**Question 3:** "[Another variant]"
- Similarity Score: 0.XX
- Answer Reused: Yes/No
- Search Method: vector_similarity
- Latency: XXXms

**Analysis:**
- Similarity threshold (0.85) correctly identified paraphrases
- Cost savings: $X.XX per reused answer
- UX improvement: XXX% faster response
```

---

## Interview Presentation Order

Present tests in this order for maximum impact:

1. **Start with Test 8.1 (Cost Savings Demo)**
   - Show concrete ROI numbers
   - "This is why this matters to the business"

2. **Show Test 1.1 (Wife vs Spouse)**
   - "Here's the exact bug I discovered and fixed"
   - Demonstrates problem-solving

3. **Demonstrate Test 2.1 (Paraphrasing)**
   - "Users don't repeat questions exactly - this handles real conversation"
   - Shows UX thinking

4. **Prove Test 5.1 (Java disambiguation)**
   - "The system isn't just matching words - it understands context"
   - Demonstrates technical depth

5. **End with Test 4.1 (Pronoun + Vector)**
   - "Here's how I integrated two AI capabilities together"
   - Shows system design skills

---

## Performance Benchmarks to Track

During testing, measure:

1. **Similarity Score Distribution:**
   - How many questions score 0.95+?
   - How many score 0.85-0.94?
   - How many false positives (<0.85 but matched)?

2. **Latency Metrics:**
   - Average embedding generation time: ~XXXms
   - Average vector search time: ~XXXms
   - Average full GPT-4o generation time: ~XXXXms
   - **Speedup:** XX% faster with caching

3. **Cost Metrics:**
   - Total questions tested: XXX
   - Questions with cached answers: XXX
   - Cost without vector search: $XX.XX
   - Cost with vector search: $XX.XX
   - **Savings:** XX%

4. **Accuracy Metrics:**
   - True positives (correctly matched): XXX
   - False positives (incorrectly matched): XXX
   - False negatives (should've matched): XXX
   - **Precision:** XX%

---

## Failure Scenarios to Test

Also verify these DON'T match incorrectly:

### Negative Test 1: Completely Different Topics
- Q1: "What is Python?"
- Q2: "What is JavaScript?"
- Expected Similarity: <0.75 (different languages)
- Should NOT reuse answer

### Negative Test 2: Opposite Questions
- Q1: "Why should I use TypeScript?"
- Q2: "Why should I avoid TypeScript?"
- Expected Similarity: ~0.70-0.80 (same topic, opposite intent)
- Should NOT reuse answer

### Negative Test 3: Similar Structure, Different Entity
- Q1: "Who is the CEO of Apple?"
- Q2: "Who is the CEO of Microsoft?"
- Expected Similarity: ~0.85-0.92 (same structure, different entity)
- Should NOT reuse answer (different company!)

**Why These Matter:** Prove the system doesn't over-match.

---

## Demo Script for Interview

**Opening:**
"Let me show you the vector database and RAG implementation I added to this AI agent. I'll demonstrate three key capabilities: semantic search, cost optimization, and real-world paraphrasing."

**Demo Flow:**
1. Open app, ask "Who is Bill Clinton's wife?"
2. Show reasoning timeline: "Generated new answer"
3. Ask "Who is Bill Clinton's spouse?"
4. Show reasoning timeline: "Semantic Search - 91.5% match - Retrieved stored answer"
5. Explain: "Notice it understood 'spouse' = 'wife' without me hardcoding that relationship. The embeddings learned this from training data."
6. Show cost comparison: "First question: $0.03, second question: $0.00002 - that's a 99.9% cost reduction"
7. Open Supabase, show vector column with 1,536 dimensions
8. Explain technical implementation: "pgvector extension, OpenAI text-embedding-3-small, cosine similarity search with 0.85 threshold"

**Closing:**
"This implementation demonstrates hands-on experience with vector databases, RAG systems, and deploying production LLM applications - directly addressing all three bonus skills in the job description."

---

## Next Steps After Testing

1. **Document Results:** Fill in similarity scores for each test
2. **Create Screenshots:** Capture key demo moments
3. **Prepare Metrics:** Calculate cost savings, speedup, accuracy
4. **Write Summary:** One-page implementation summary for interview
5. **Practice Demo:** Run through presentation 2-3 times

**Time to Complete Testing:** ~2-3 hours to run all scenarios and document results
