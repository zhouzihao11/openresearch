import type { AtomTable, AtomRelationTable } from "../../research/research.sql"

export type AtomRow = typeof AtomTable.$inferSelect
export type AtomRelationRow = typeof AtomRelationTable.$inferSelect

export type AtomType = "fact" | "method" | "theorem" | "verification"
export type RelationType = "motivates" | "formalizes" | "derives" | "analyzes" | "validates" | "contradicts" | "other"

export interface TraversalOptions {
  seedAtomIds: string[]
  maxDepth: number
  maxAtoms?: number
  relationTypes?: RelationType[]
  atomTypes?: AtomType[]
}

export interface TraversedAtom {
  atom: AtomRow
  claim: string
  evidence: string
  distance: number
  path: string[]
  relationChain: RelationType[]
  claimEmbedding?: number[] // Optional: for semantic search (Phase 2)
}

export interface PromptBuilderOptions {
  template: "graphrag" | "compact"
  includeEvidence: boolean
  includeMetadata: boolean
}

export interface AtomContent {
  claim: string
  evidence: string
}

// Phase 3: Community Detection Types
export interface Community {
  id: string
  atomIds: string[]
  summary: string
  keywords: string[]
  dominantType: AtomType
  size: number
  density: number
  timestamp: number
}

export interface CommunityFilterOptions {
  communityIds?: string[]
  minCommunitySize?: number
  maxCommunitySize?: number
  dominantTypes?: AtomType[]
}
