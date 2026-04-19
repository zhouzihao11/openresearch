import type { TraversedAtom } from "./types"

/**
 * Token 预算管理（不依赖外部库的简化实现）
 *
 * 注意：这是一个简化的 token 计数器
 * 生产环境应该使用 tiktoken 或类似库获得精确计数
 */

/**
 * 估算文本的 token 数量
 *
 * 简化规则：
 * - 英文：约 4 个字符 = 1 token
 * - 中文：约 1.5 个字符 = 1 token
 * - 代码：约 3 个字符 = 1 token
 */
export function estimateTokens(text: string): number {
  if (!text) return 0

  // 统计中文字符
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length

  // 统计代码块
  const codeBlocks = (text.match(/```[\s\S]*?```/g) || []).join("")
  const codeChars = codeBlocks.length

  // 剩余字符
  const remainingChars = text.length - chineseChars - codeChars

  // 计算 tokens
  const chineseTokens = chineseChars / 1.5
  const codeTokens = codeChars / 3
  const englishTokens = remainingChars / 4

  return Math.ceil(chineseTokens + codeTokens + englishTokens)
}

/**
 * 估算单个 atom 的 token 数量
 */
export function estimateAtomTokens(atom: TraversedAtom, includeEvidence: boolean, includeMetadata: boolean): number {
  let tokens = 0

  // Atom 名称和类型
  tokens += estimateTokens(atom.atom.atom_name)
  tokens += 5 // 类型标记

  // Claim
  tokens += estimateTokens(atom.claim)
  tokens += 10 // 格式化开销

  // Evidence
  if (includeEvidence && atom.evidence) {
    tokens += estimateTokens(atom.evidence)
    tokens += 10 // 格式化开销
  }

  // Metadata
  if (includeMetadata) {
    tokens += 30 // 元数据固定开销
  }

  return tokens
}

/**
 * Token 预算选择选项
 */
export interface TokenBudgetOptions {
  maxTokens: number
  includeEvidence: boolean
  includeMetadata: boolean
  reserveTokens?: number // 为模板和指令预留的 tokens
}

/**
 * 在 token 预算内选择 atoms
 *
 * 使用贪心算法：按分数排序，依次添加直到超出预算
 */
export function selectAtomsWithinBudget(
  atoms: Array<TraversedAtom & { score: number }>,
  options: TokenBudgetOptions,
): {
  selected: Array<TraversedAtom & { score: number }>
  totalTokens: number
  budgetUsed: number
} {
  const { maxTokens, includeEvidence, includeMetadata, reserveTokens = 200 } = options

  const availableBudget = maxTokens - reserveTokens
  const selected: Array<TraversedAtom & { score: number }> = []
  let totalTokens = 0

  // 按分数排序（已经排序过的话就不需要了）
  const sorted = [...atoms].sort((a, b) => b.score - a.score)

  for (const atom of sorted) {
    const atomTokens = estimateAtomTokens(atom, includeEvidence, includeMetadata)

    if (totalTokens + atomTokens <= availableBudget) {
      selected.push(atom)
      totalTokens += atomTokens
    } else {
      // 预算不足，停止添加
      break
    }
  }

  return {
    selected,
    totalTokens: totalTokens + reserveTokens,
    budgetUsed: (totalTokens + reserveTokens) / maxTokens,
  }
}

/**
 * 动态调整内容以适应预算
 *
 * 策略：
 * 1. 首先尝试包含所有 atoms 但不包含 evidence
 * 2. 如果还是超出，减少 atoms 数量
 * 3. 如果有余量，逐步添加 evidence
 */
export function adaptiveBudgetSelection(
  atoms: Array<TraversedAtom & { score: number }>,
  maxTokens: number,
): {
  selected: Array<TraversedAtom & { score: number }>
  includeEvidence: boolean
  includeMetadata: boolean
  totalTokens: number
} {
  const reserveTokens = 200

  // 策略 1: 尝试包含所有 atoms（无 evidence）
  let result = selectAtomsWithinBudget(atoms, {
    maxTokens,
    includeEvidence: false,
    includeMetadata: true,
    reserveTokens,
  })

  if (result.selected.length === atoms.length) {
    // 所有 atoms 都能放下，尝试添加 evidence
    const withEvidence = selectAtomsWithinBudget(atoms, {
      maxTokens,
      includeEvidence: true,
      includeMetadata: true,
      reserveTokens,
    })

    if (withEvidence.selected.length >= atoms.length * 0.8) {
      // 至少 80% 的 atoms 能包含 evidence
      return {
        selected: withEvidence.selected,
        includeEvidence: true,
        includeMetadata: true,
        totalTokens: withEvidence.totalTokens,
      }
    }

    // 否则，全部 atoms 但无 evidence
    return {
      selected: result.selected,
      includeEvidence: false,
      includeMetadata: true,
      totalTokens: result.totalTokens,
    }
  }

  // 策略 2: 无法包含所有 atoms，只选择高分的
  return {
    selected: result.selected,
    includeEvidence: false,
    includeMetadata: true,
    totalTokens: result.totalTokens,
  }
}

/**
 * 计算 prompt 模板的基础 token 开销
 */
export function estimateTemplateTokens(template: "graphrag" | "compact"): number {
  if (template === "graphrag") {
    // GraphRAG 模板有更多的格式化文本
    return 150
  } else {
    // Compact 模板更简洁
    return 50
  }
}

/**
 * 预估完整 prompt 的 token 数量
 */
export function estimatePromptTokens(
  atoms: TraversedAtom[],
  template: "graphrag" | "compact",
  includeEvidence: boolean,
  includeMetadata: boolean,
): number {
  let total = estimateTemplateTokens(template)

  for (const atom of atoms) {
    total += estimateAtomTokens(atom, includeEvidence, includeMetadata)
  }

  // 关系部分
  total += atoms.length * 5 // 每个 atom 平均 5 tokens 用于关系

  return total
}

/**
 * Token 预算报告
 */
export interface TokenBudgetReport {
  totalTokens: number
  breakdown: {
    template: number
    atoms: number
    relationships: number
  }
  atomDetails: Array<{
    atomId: string
    atomName: string
    tokens: number
  }>
  budgetUsed: number
  budgetRemaining: number
}

/**
 * 生成详细的 token 预算报告
 */
export function generateTokenReport(
  atoms: TraversedAtom[],
  template: "graphrag" | "compact",
  includeEvidence: boolean,
  includeMetadata: boolean,
  maxTokens: number,
): TokenBudgetReport {
  const templateTokens = estimateTemplateTokens(template)
  const relationshipTokens = atoms.length * 5

  const atomDetails = atoms.map((atom) => ({
    atomId: atom.atom.atom_id,
    atomName: atom.atom.atom_name,
    tokens: estimateAtomTokens(atom, includeEvidence, includeMetadata),
  }))

  const atomsTokens = atomDetails.reduce((sum, detail) => sum + detail.tokens, 0)
  const totalTokens = templateTokens + atomsTokens + relationshipTokens

  return {
    totalTokens,
    breakdown: {
      template: templateTokens,
      atoms: atomsTokens,
      relationships: relationshipTokens,
    },
    atomDetails,
    budgetUsed: totalTokens / maxTokens,
    budgetRemaining: maxTokens - totalTokens,
  }
}
