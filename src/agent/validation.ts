import type { MemoryExistenceCheck, MemoryDependencyDecision } from "@/lib/schemas"

/**
 * Memory Decision Validation
 *
 * Enforces the MANDATORY distinction between:
 * 1. Memory existence - Whether similar question was asked before
 * 2. Memory dependency - Whether prior memory is required for reasoning
 *
 * These validation rules prevent reasoning correctness bugs where:
 * - Agent states "memory not needed" without checking if it exists
 * - Agent ignores previously answered identical questions
 * - Agent conflates "self-contained question" with "no prior memory exists"
 */

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate that memory existence and dependency decisions are correctly distinguished.
 */
export function validateMemoryDecisions(
  existenceCheck: MemoryExistenceCheck,
  dependencyDecision: MemoryDependencyDecision
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Rule 1: Must always perform existence check
  if (!existenceCheck.searchQuery || existenceCheck.searchQuery.trim() === "") {
    errors.push("Existence check must include a search query")
  }

  if (!existenceCheck.explanation || existenceCheck.explanation.trim() === "") {
    errors.push("Existence check must include an explanation")
  }

  // Rule 2: If similar question exists, must acknowledge it
  if (existenceCheck.similarQuestionExists) {
    if (!existenceCheck.existingRunId) {
      errors.push("Similar question exists but no runId provided")
    }
    if (!existenceCheck.existingQuestion) {
      errors.push("Similar question exists but no question text provided")
    }
    if (!existenceCheck.existingAnswer) {
      errors.push("Similar question exists but no answer provided")
    }
  }

  // Rule 3: Dependency decision must have clear reasoning
  if (!dependencyDecision.reason || dependencyDecision.reason.trim() === "") {
    errors.push("Memory dependency decision must include a reason")
  }

  // Rule 4: MANDATORY pronoun resolution
  if (dependencyDecision.pronounResolution) {
    const pr = dependencyDecision.pronounResolution

    // If pronouns detected, resolution must be attempted
    if (pr.hasPronouns && !pr.resolutionAttempted) {
      errors.push("Pronouns detected but resolution was not attempted - this is MANDATORY")
    }

    // If resolution attempted, must provide explanation
    if (pr.resolutionAttempted && (!pr.resolutionExplanation || pr.resolutionExplanation.trim() === "")) {
      errors.push("Pronoun resolution attempted but no explanation provided")
    }

    // If resolved, must provide resolved entities
    if (pr.resolved && (!pr.resolvedEntities || pr.resolvedEntities.length === 0)) {
      errors.push("Pronouns marked as resolved but no resolved entities provided")
    }

    // If pronouns found, list should not be empty
    if (pr.hasPronouns && (!pr.pronounsFound || pr.pronounsFound.length === 0)) {
      warnings.push("Pronouns detected but list of pronouns is empty")
    }

    // Check confidence scores
    if (pr.resolvedEntities) {
      for (const entity of pr.resolvedEntities) {
        if (entity.confidence < 0 || entity.confidence > 1) {
          errors.push(`Invalid confidence score for "${entity.pronoun}": ${entity.confidence}`)
        }
        if (entity.confidence < 0.3) {
          warnings.push(`Low confidence (${entity.confidence}) for pronoun resolution: "${entity.pronoun}" → "${entity.resolvedTo}"`)
        }
      }
    }
  }

  // Rule 5: Validate logical consistency
  // If similar question exists AND dependency not required, should acknowledge both
  if (existenceCheck.similarQuestionExists && !dependencyDecision.requiresMemory) {
    const reasonLower = dependencyDecision.reason.toLowerCase()
    // Reason should mention that question was asked before or that existing answer can be reused
    if (!reasonLower.includes("similar") &&
        !reasonLower.includes("previous") &&
        !reasonLower.includes("asked before") &&
        !reasonLower.includes("existing") &&
        !reasonLower.includes("reuse")) {
      warnings.push("Similar question exists but dependency reason doesn't acknowledge this")
    }
  }

  // Rule 6: If pronouns exist and are resolved, memory should generally be required
  if (dependencyDecision.pronounResolution?.resolved &&
      dependencyDecision.pronounResolution.resolvedEntities &&
      dependencyDecision.pronounResolution.resolvedEntities.length > 0 &&
      !dependencyDecision.requiresMemory) {
    warnings.push("Pronouns were resolved using prior context but memory is marked as not required - this may be inconsistent")
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Format validation result for logging/debugging.
 */
export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = []

  if (result.valid) {
    lines.push("✓ Memory decision validation passed")
  } else {
    lines.push("✗ Memory decision validation FAILED")
  }

  if (result.errors.length > 0) {
    lines.push("\nErrors:")
    result.errors.forEach(error => {
      lines.push(`  - ${error}`)
    })
  }

  if (result.warnings.length > 0) {
    lines.push("\nWarnings:")
    result.warnings.forEach(warning => {
      lines.push(`  - ${warning}`)
    })
  }

  return lines.join("\n")
}

/**
 * Validate pronoun detection in user question.
 * Returns list of potential pronouns/references that should be resolved.
 */
export function detectPronouns(question: string): {
  hasPronouns: boolean
  pronounsFound: string[]
  explanation: string
} {
  const pronounPatterns = [
    // Personal pronouns
    /\b(he|him|his|she|her|hers|they|them|their|theirs|it|its)\b/gi,
    // Demonstrative pronouns
    /\b(this|that|these|those)\b/gi,
    // Implicit references
    /\bthe (person|company|project|organization|system|application|product|service|tool|library|framework|same|one)\b/gi,
    // Reference words
    /\b(there|here)\b/gi,
  ]

  const foundPronouns = new Set<string>()
  let explanation = ""

  for (const pattern of pronounPatterns) {
    const matches = question.match(pattern)
    if (matches) {
      matches.forEach(match => foundPronouns.add(match.toLowerCase()))
    }
  }

  const pronounList = Array.from(foundPronouns)

  if (pronounList.length > 0) {
    explanation = `Found ${pronounList.length} pronoun(s)/reference(s): ${pronounList.join(", ")}`
  } else {
    explanation = "No pronouns or implicit references detected"
  }

  return {
    hasPronouns: pronounList.length > 0,
    pronounsFound: pronounList,
    explanation,
  }
}
