/**
 * NEXUS AI — Multi-Signal Entity Resolution Engine
 *
 * Resolves variations such as:
 *   - "Ramesh Kumar", "R. Kumar", "Ramesh K.", "R KUMAR", "Mr. Ramesh Kumar"
 * into a single canonical entity (e.g. "PERSON_001").
 *
 * Incorporates:
 *   - Exact matching
 *   - Normalized string & token analysis
 *   - Initials expansion / contraction matching
 *   - Unique identifier matching (PAN, Phone, Account, Aadhaar)
 *   - Disambiguation guards (Never merge if unique identifiers conflict!)
 */

import type { RawEntityMention, ResolvedEntity, EntityType } from '../models/types.ts';
import { normalizePersonName, normalizeIdentifier } from '../normalization/text.ts';

// Jaro-Winkler string similarity implementation
export function calculateStringSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  const a = s1.toLowerCase();
  const b = s2.toLowerCase();
  if (a === b) return 1.0;

  const m = Math.floor(Math.max(a.length, b.length) / 2) - 1;
  const aMatches = new Array(a.length).fill(false);
  const bMatches = new Array(b.length).fill(false);

  let matches = 0;
  for (let i = 0; i < a.length; i++) {
    const start = Math.max(0, i - m);
    const end = Math.min(i + m + 1, b.length);
    for (let j = start; j < end; j++) {
      if (!bMatches[j] && a[i] === b[j]) {
        aMatches[i] = true;
        bMatches[j] = true;
        matches++;
        break;
      }
    }
  }

  if (matches === 0) return 0.0;

  let k = 0;
  let transpositions = 0;
  for (let i = 0; i < a.length; i++) {
    if (aMatches[i]) {
      while (!bMatches[k]) k++;
      if (a[i] !== b[k]) transpositions++;
      k++;
    }
  }

  const sim = (matches / a.length + matches / b.length + (matches - transpositions / 2) / matches) / 3;
  return Math.min(1.0, Math.max(0.0, sim));
}

// Compare two person names by initials and token compatibility
export function compareNameVariants(rawA: string, rawB: string): { matches: boolean; score: number; reason: string } {
  const normA = normalizePersonName(rawA);
  const normB = normalizePersonName(rawB);

  // Exact canonical match
  if (normA.canonical_name.toLowerCase() === normB.canonical_name.toLowerCase()) {
    return { matches: true, score: 0.98, reason: 'Exact normalized name match' };
  }

  const tokA = normA.tokens;
  const tokB = normB.tokens;

  if (tokA.length === 0 || tokB.length === 0) {
    return { matches: false, score: 0.0, reason: 'Empty name tokens' };
  }

  // Check 1: Initials vs Full Name (e.g. "R. Kumar" vs "Ramesh Kumar" or "Ramesh K." vs "Ramesh Kumar")
  if (tokA.length === 2 && tokB.length === 2) {
    const [firstA, lastA] = tokA;
    const [firstB, lastB] = tokB;

    // "R. Kumar" vs "Ramesh Kumar"
    if (lastA === lastB) {
      if ((firstA.length === 1 && firstB.startsWith(firstA)) || (firstB.length === 1 && firstA.startsWith(firstB))) {
        return { matches: true, score: 0.88, reason: `Initial match on first name with identical surname "${lastA}"` };
      }
    }

    // "Ramesh K." vs "Ramesh Kumar"
    if (firstA === firstB) {
      if ((lastA.length === 1 && lastB.startsWith(lastA)) || (lastB.length === 1 && lastA.startsWith(lastB))) {
        return { matches: true, score: 0.88, reason: `Initial match on last name with identical first name "${firstA}"` };
      }
    }
  }

  // Check 2: All tokens in shorter name match initials or prefix in longer name
  const [shorter, longer] = tokA.length <= tokB.length ? [tokA, tokB] : [tokB, tokA];
  let compatibleTokens = 0;

  for (let i = 0; i < shorter.length; i++) {
    const s = shorter[i];
    const matchFound = longer.some(l => l === s || (s.length === 1 && l.startsWith(s)) || (l.length === 1 && s.startsWith(l)));
    if (matchFound) compatibleTokens++;
  }

  if (compatibleTokens === shorter.length && shorter.length >= 2) {
    return { matches: true, score: 0.85, reason: 'Subset token and initial compatibility' };
  }

  // Check 3: High string similarity (handles minor typos / OCR artifacts e.g. "Rarnesh Kumar" vs "Ramesh Kumar")
  const sim = calculateStringSimilarity(normA.canonical_name, normB.canonical_name);
  if (sim >= 0.90) {
    return { matches: true, score: sim * 0.9, reason: `High string similarity (${(sim * 100).toFixed(1)}%)` };
  }

  return { matches: false, score: sim * 0.5, reason: 'Names are distinct' };
}

export class EntityResolver {
  private entityCounter: Record<EntityType, number> = {
    PERSON: 0,
    ORGANIZATION: 0,
    ACCOUNT: 0,
    ASSET: 0,
    LOCATION: 0,
    IDENTIFIER: 0,
  };

  private generateEntityId(type: EntityType): string {
    this.entityCounter[type] = (this.entityCounter[type] || 0) + 1;
    const prefix = type.toUpperCase();
    const pad = String(this.entityCounter[type]).padStart(3, '0');
    return `${prefix}_${pad}`;
  }

  /**
   * Resolves raw entity mentions into canonical entities.
   */
  public resolveEntities(mentions: RawEntityMention[]): ResolvedEntity[] {
    const resolved: ResolvedEntity[] = [];

    for (const mention of mentions) {
      let matchedEntity: ResolvedEntity | null = null;
      let highestScore = 0;
      let matchRationale = '';

      // Normalize identifiers for this mention
      const normalizedMentionIds: Record<string, string> = {};
      if (mention.identifiers) {
        for (const [k, v] of Object.entries(mention.identifiers)) {
          if (v) normalizedMentionIds[k.toLowerCase()] = normalizeIdentifier(k, v);
        }
      }

      for (const candidate of resolved) {
        // Must match entity type
        if (candidate.entity_type !== mention.entity_type) continue;

        // Disambiguation Guard: Check for conflicting unique identifiers
        let identifierConflict = false;
        let identifierMatch = false;

        const uniqueKeys = ['pan', 'passport', 'phone', 'account_number', 'aadhaar', 'email'];
        for (const key of uniqueKeys) {
          const valInCandidate = candidate.identifiers[key];
          const valInMention = normalizedMentionIds[key];

          if (valInCandidate && valInMention) {
            if (valInCandidate === valInMention) {
              identifierMatch = true;
            } else {
              // Different unique identifier -> ABSOLUTE CONFLICT, DO NOT MERGE!
              identifierConflict = true;
              break;
            }
          }
        }

        if (identifierConflict) {
          // Different PAN/Passport/Account -> Two distinct entities!
          continue;
        }

        if (identifierMatch) {
          // Shared unique identifier -> Definite merge!
          matchedEntity = candidate;
          highestScore = 0.99;
          matchRationale = 'Matched unique identifier';
          break;
        }

        // Compare names across candidate's canonical name and all existing aliases
        const allNamesToTest = [candidate.canonical_name, ...candidate.aliases];
        for (const nameToTest of allNamesToTest) {
          const nameCmp = compareNameVariants(nameToTest, mention.raw_name);
          if (nameCmp.matches && nameCmp.score > highestScore) {
            highestScore = nameCmp.score;
            matchedEntity = candidate;
            matchRationale = nameCmp.reason;
          }
        }
      }

      if (matchedEntity && highestScore >= 0.80) {
        // Merge into existing candidate
        matchedEntity.mention_ids.push(mention.mention_id);
        const normMention = normalizePersonName(mention.raw_name);

        if (!matchedEntity.aliases.includes(mention.raw_name) && mention.raw_name !== matchedEntity.canonical_name) {
          matchedEntity.aliases.push(mention.raw_name);
        }

        // Prefer longer / more complete name as canonical
        if (normMention.canonical_name.length > matchedEntity.canonical_name.length && !normMention.canonical_name.includes('.')) {
          matchedEntity.aliases.push(matchedEntity.canonical_name);
          matchedEntity.canonical_name = normMention.canonical_name;
        }

        // Merge identifiers
        for (const [k, v] of Object.entries(normalizedMentionIds)) {
          if (!matchedEntity.identifiers[k]) {
            matchedEntity.identifiers[k] = v;
          }
        }

        matchedEntity.confidence_score = Math.max(matchedEntity.confidence_score, highestScore);
        matchedEntity.resolution_rationale += `; Merged mention "${mention.raw_name}" via ${matchRationale}`;
      } else {
        // Create new canonical entity
        const normName = normalizePersonName(mention.raw_name);
        const canonicalName = normName.canonical_name || mention.raw_name.trim();
        const newId = this.generateEntityId(mention.entity_type);

        const newEntity: ResolvedEntity = {
          entity_id: newId,
          canonical_name: canonicalName,
          entity_type: mention.entity_type,
          aliases: [mention.raw_name],
          identifiers: { ...normalizedMentionIds },
          mention_ids: [mention.mention_id],
          confidence_score: 0.95,
          resolution_rationale: `Initialized new entity for "${mention.raw_name}"`,
        };

        resolved.push(newEntity);
      }
    }

    return resolved;
  }
}
