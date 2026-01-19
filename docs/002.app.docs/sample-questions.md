# Sample Questions for Testing Memory & Pronoun Resolution

This document contains curated question sequences to test all memory scenarios, pronoun resolution, and similarity detection in the AI agent system.

---

## Test Scenario 1: Basic Pronoun Resolution

**Objective**: Test that pronouns are resolved using recent context

### Sequence:
1. `Who is Tim Cook?`
2. `How old is he?`
3. `Where was he born?`
4. `What company does he lead?`
5. `When did he become CEO?`

**Expected Behavior**:
- Question 1: No prior memory, self-contained
- Questions 2-5: Should resolve "he" → "Tim Cook" and use that context

---

## Test Scenario 2: Exact Question Repetition

**Objective**: Test that identical questions are recognized

### Sequence:
1. `What is the capital of France?`
2. `What is the capital of France?`

**Expected Behavior**:
- Question 1: No prior memory
- Question 2: Should find similar question exists, potentially reuse answer

---

## Test Scenario 3: Semantic Similarity (Synonyms)

**Objective**: Test that semantically similar questions are recognized

### Sequence:
1. `Where does Elon Musk live right now?`
2. `Where does he live currently?`
3. `What is his current residence?`

**Expected Behavior**:
- Question 1: No prior memory
- Question 2: Should find similar question ("right now" ≈ "currently"), resolve "he" → "Elon Musk"
- Question 3: Should find similar questions, resolve "his" → "Elon Musk"

---

## Test Scenario 4: Paraphrased Questions

**Objective**: Test recognition of differently worded questions with same intent

### Sequence:
1. `Who invented the telephone?`
2. `Who created the telephone?`
3. `Who is credited with inventing the telephone?`

**Expected Behavior**:
- Question 1: No prior memory
- Question 2: Should recognize similarity ("invented" ≈ "created")
- Question 3: Should recognize similarity despite different structure

---

## Test Scenario 5: Multiple Pronouns in Conversation

**Objective**: Test complex pronoun chains

### Sequence:
1. `Tell me about Steve Jobs`
2. `What company did he found?`
3. `When did he pass away?`
4. `Who succeeded him at Apple?`
5. `How long has that person been CEO?`

**Expected Behavior**:
- Question 1: No prior memory
- Questions 2-3: Resolve "he" → "Steve Jobs"
- Question 4: Resolve "him" → "Steve Jobs"
- Question 5: Resolve "that person" → answer from question 4 (Tim Cook)

---

## Test Scenario 6: Context Switching

**Objective**: Test that context switches correctly between topics

### Sequence:
1. `Who is Sundar Pichai?`
2. `Where was he born?`
3. `Who is Satya Nadella?`
4. `Where was he born?`

**Expected Behavior**:
- Question 1: No prior memory (about Sundar Pichai)
- Question 2: Resolve "he" → "Sundar Pichai"
- Question 3: No prior memory (about Satya Nadella - different person)
- Question 4: Resolve "he" → "Satya Nadella" (most recent person)

---

## Test Scenario 6a: Most Recent Entity Resolution (Critical Bug Test)

**Objective**: Test that pronouns ALWAYS resolve to the MOST RECENT entity, not older ones from history

### Sequence:
1. `Who is Elon Musk?`
2. `How old is he and where does he live?`

**Expected Behavior**:
- Question 1: No prior memory, self-contained answer about Elon Musk
- Question 2: **MUST resolve "he" → "Elon Musk"** (most recent entity)

**Critical Failure Case**:
- ❌ If the system has older history about "Tim Cook" or another person, it should **NOT** resolve to that person
- ❌ The system must **NEVER** skip the most recent question to use older entities

**Why This Test Exists**:
This test was added after discovering a bug where the pronoun resolution was incorrectly resolving "he" to "Tim Cook" from older conversation history instead of "Elon Musk" from the immediately previous question.

**Implementation Fix** (in `memory-dependency-decision.ts`):
- The `recentQuestions` array is now explicitly labeled as `recentQuestions_ORDERED_MOST_RECENT_FIRST`
- Each question includes a `recencyRank` field (0 = most recent)
- The prompt explicitly instructs to **ALWAYS look at index 0 FIRST**
- Example in prompt: "If recentQuestions[0] = 'Who is Elon Musk?' → resolve 'he' → 'Elon Musk'"

---

## Test Scenario 7: Implicit References

**Objective**: Test resolution of non-pronoun references

### Sequence:
1. `What does Microsoft do?`
2. `Who founded the company?`
3. `When was the company established?`
4. `What is the company's market cap?`

**Expected Behavior**:
- Question 1: No prior memory
- Questions 2-4: Resolve "the company" → "Microsoft"

---

## Test Scenario 8: Different Questions, Same Subject

**Objective**: Test that different questions about same subject are NOT marked as similar

### Sequence:
1. `What is Python?`
2. `How does Python work?`
3. `What is Python used for?`
4. `Who created Python?`

**Expected Behavior**:
- Question 1: No prior memory
- Question 2: Should NOT be marked as similar (different intent: "what is" vs "how does it work")
- Question 3: Should NOT be marked as similar (different intent: asking about use cases)
- Question 4: Should NOT be marked as similar (different intent: asking about creator)

---

## Test Scenario 9: Session Persistence (After Restart)

**Objective**: Test that memory persists across app restarts

### Sequence (Session 1):
1. `Who is Jeff Bezos?`
2. `What company did he found?`

### Stop and restart the app

### Sequence (Session 2):
3. `Where did he go to college?`

**Expected Behavior**:
- Questions 1-2: Normal operation
- After restart, Question 3: Should still find "Jeff Bezos" in memory and resolve "he" → "Jeff Bezos"

---

## Test Scenario 10: Question Format Variations

**Objective**: Test different question formats are recognized as similar

### Sequence:
1. `What is the population of Tokyo?`
2. `How many people live in Tokyo?`
3. `Tokyo population?`

**Expected Behavior**:
- Question 1: No prior memory
- Question 2: Should recognize similarity (different wording, same intent)
- Question 3: Should recognize similarity (abbreviated form)

---

## Test Scenario 11: Demonstrative Pronouns

**Objective**: Test resolution of this/that/these/those

### Sequence:
1. `Tell me about the Eiffel Tower`
2. `When was this built?`
3. `Where is that located?`
4. `Who designed this structure?`

**Expected Behavior**:
- Question 1: No prior memory
- Questions 2-4: Resolve "this"/"that" → "Eiffel Tower"

---

## Test Scenario 12: Ambiguous Pronouns (Should Ask for Clarification)

**Objective**: Test that truly ambiguous pronouns are handled appropriately

### Sequence:
1. `Tell me about Barack Obama and Joe Biden`
2. `Where was he born?`

**Expected Behavior**:
- Question 1: No prior memory
- Question 2: Ambiguous "he" (could be Obama or Biden). Should either:
  - Resolve to most recently mentioned (Biden)
  - Or acknowledge ambiguity in reasoning

---

## Test Scenario 13: Long Context Chain

**Objective**: Test pronoun resolution with longer conversation chains

### Sequence:
1. `Who is the CEO of Tesla?`
2. `What other companies does he run?`
3. `What is his net worth?`
4. `Where did he grow up?`
5. `What degrees does he hold?`
6. `When did he move to the United States?`

**Expected Behavior**:
- Question 1: No prior memory
- Questions 2-6: Should consistently resolve "he" to the answer from question 1

---

## Test Scenario 14: Location References

**Objective**: Test resolution of location-based implicit references

### Sequence:
1. `What is the weather in Seattle?`
2. `What is the population there?`
3. `What companies are headquartered there?`
4. `What is the cost of living in that city?`

**Expected Behavior**:
- Question 1: No prior memory
- Questions 2-4: Resolve "there"/"that city" → "Seattle"

---

## Test Scenario 15: Memory Exists But Not Required

**Objective**: Test distinction between memory existence and dependency

### Sequence:
1. `What is 2 + 2?`
2. `What is 2 + 2?`

**Expected Behavior**:
- Question 1: No prior memory, self-contained
- Question 2:
  - Memory existence: TRUE (found previous question)
  - Memory dependency: FALSE (self-contained math question)
  - Reasoning: "This question was asked previously. Prior context is not required, so the existing answer will be reused."

---

## Test Scenario 16: Follow-up Clarifications

**Objective**: Test that clarification questions reference prior context

### Sequence:
1. `Explain quantum computing`
2. `Can you explain that in simpler terms?`
3. `What are some practical applications?`
4. `How does that compare to classical computing?`

**Expected Behavior**:
- Question 1: No prior memory
- Question 2: Resolve "that" → "quantum computing explanation"
- Question 3: Understand "applications" refers to quantum computing
- Question 4: Resolve "that" → "quantum computing"

---

## Test Scenario 17: Possessive Pronouns

**Objective**: Test resolution of possessive pronouns (his/her/their)

### Sequence:
1. `Who is Taylor Swift?`
2. `What is her most popular song?`
3. `When did her career start?`
4. `What are her albums?`

**Expected Behavior**:
- Question 1: No prior memory
- Questions 2-4: Resolve "her" → "Taylor Swift"

---

## Test Scenario 18: Mixed Pronouns

**Objective**: Test handling of multiple pronoun types

### Sequence:
1. `Tell me about Marie Curie`
2. `What did she discover?`
3. `Where did she work?`
4. `What was her nationality?`
5. `What awards did she receive?`

**Expected Behavior**:
- Question 1: No prior memory
- Questions 2-5: Resolve "she"/"her" → "Marie Curie"

---

## Test Scenario 19: Technical Similarity Detection

**Objective**: Test similarity detection on technical topics

### Sequence:
1. `How do I reverse a string in Python?`
2. `How can I reverse a string in Python?`
3. `Python string reversal method?`

**Expected Behavior**:
- Question 1: No prior memory
- Question 2: Should recognize as similar (almost identical)
- Question 3: Should recognize as similar (same intent, abbreviated)

---

## Test Scenario 20: Edge Case - "It" Resolution

**Objective**: Test resolution of the most ambiguous pronoun "it"

### Sequence:
1. `What is Docker?`
2. `How do I install it?`
3. `What are the benefits of using it?`
4. `How does it compare to virtual machines?`

**Expected Behavior**:
- Question 1: No prior memory
- Questions 2-4: Resolve "it" → "Docker"

---

## Quick Test Checklist

Use this checklist to verify all core functionality:

- [ ] Basic pronoun resolution (he/she/it)
- [ ] **Most recent entity resolution** (pronouns resolve to most recent, not older history)
- [ ] Exact question repetition detected
- [ ] Synonym detection ("right now" vs "currently")
- [ ] Paraphrase detection (different wording, same intent)
- [ ] Implicit reference resolution ("the company", "that person")
- [ ] Demonstrative pronoun resolution (this/that/these/those)
- [ ] Memory persistence after app restart
- [ ] Context switching between different subjects
- [ ] Memory existence vs. dependency distinction
- [ ] Multiple pronouns in conversation chain
- [ ] Possessive pronoun resolution (his/her/their)
- [ ] Location reference resolution ("there", "that city")

---

## Notes for Testers

1. **Clear Cache Between Tests**: When testing session persistence, make sure to actually restart the app (stop and `pnpm run dev` again)

2. **Check Reasoning Steps**: Always review the reasoning timeline to see:
   - Memory existence check results
   - Memory dependency decision
   - Pronoun resolution details
   - Whether memory was retrieved

3. **Expected Timeline Format**:
   - "Similar question found: ..." OR "No similar question found..."
   - "Resolved references: 'he' → 'Tim Cook'" (if pronouns detected)
   - "This question was asked previously..." (for memory exists scenarios)
   - "Using prior context from a previous question..." (for memory dependency)

4. **Failure Indicators**:
   - ❌ "No prior memory found" when similar question exists
   - ❌ "I don't know who 'he' refers to" when context is available
   - ❌ Pronouns not resolved when they should be
   - ❌ Different questions marked as similar when they have different intents
   - ❌ **Pronouns resolved to older entities instead of most recent** (e.g., resolving "he" to "Tim Cook" when most recent question was about "Elon Musk")

5. **Success Indicators**:
   - ✅ Pronouns correctly resolved with confidence scores
   - ✅ **Pronouns ALWAYS resolve to the MOST RECENT relevant entity**
   - ✅ Similar questions recognized (including synonyms/paraphrasing)
   - ✅ Memory existence acknowledged even when not needed for reasoning
   - ✅ Context preserved across multi-turn conversations
   - ✅ Answers reference the resolved entity correctly
