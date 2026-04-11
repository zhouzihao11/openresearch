# Atom Graph Prompt 工具开发计划

## 项目概述

Atom Graph Prompt 是一个基于知识图谱的智能 prompt 生成工具，用于从 Atom Graph 中提取相关知识并生成结构化的 prompt。

## 开发阶段

### ✅ Phase 1: 图遍历与基础 Prompt 生成（已完成）

**目标**: 实现基础的图遍历和 prompt 构建功能

**完成内容**:

- ✅ BFS 图遍历算法
- ✅ GraphRAG 和 Compact 两种模板
- ✅ 关系和类型过滤
- ✅ 自动推断起始点
- ✅ Token 预算管理基础

**文件**:

- `traversal.ts` - 图遍历
- `builder.ts` - Prompt 构建
- `types.ts` - 类型定义

---

### ✅ Phase 2: 智能检索与评分系统（已完成）

**目标**: 添加语义搜索和智能评分功能

**完成内容**:

- ✅ Embedding 缓存系统
- ✅ 语义相似度搜索
- ✅ 5维度智能评分（距离、类型、语义、时序、关系链）
- ✅ 混合检索（图遍历 + 语义搜索）
- ✅ 多样性选择算法
- ✅ 自适应 Token 预算管理
- ✅ `atom_graph_prompt_smart` 工具

**文件**:

- `embedding.ts` - Embedding 管理
- `scoring.ts` - 智能评分
- `hybrid.ts` - 混合检索
- `token-budget.ts` - Token 预算
- `atom-graph-prompt-smart.ts` - 智能工具

---

### ✅ Phase 3.1: 社区检测（已完成）

**目标**: 使用 Louvain 算法检测 Atom Graph 中的社区结构

**完成内容**:

- ✅ Louvain 算法集成（graphology + graphology-communities-louvain）
- ✅ 社区缓存系统（文件缓存，不改动数据库）
- ✅ 社区摘要自动生成
- ✅ 社区查询（支持自然语言）
- ✅ 社区统计信息
- ✅ 集成到 `atom_graph_prompt_smart` 工具
- ✅ 社区级别 Prompt 生成
- ✅ 完整文档

**文件**:

- `community.ts` (440 行) - 社区检测核心
- `types.ts` - 添加社区类型
- `hybrid.ts` - 社区过滤支持
- `builder.ts` - 社区 Prompt 生成
- `atom-graph-prompt-smart.ts` - 社区参数集成

**新增 API**:

- `detectCommunities()` - 检测社区
- `queryCommunities()` - 查询社区
- `getCommunityStats()` - 统计信息
- `getAtomCommunity()` - 查询 atom 所属社区
- `refreshCommunities()` - 刷新缓存
- `buildCommunityPrompt()` - 社区级别 Prompt

---

### ✅ Phase 3.1 测试补全（已完成）

**目标**: 修复已有测试并编写全覆盖的测试套件

**完成内容**:

- ✅ 修复 community.test.ts 数据库依赖问题（ResearchProject FK、session_id FK、唯一 ID）
- ✅ 编写 Phase 2 测试: embedding.test.ts (6 tests)
- ✅ 编写 Phase 2 测试: scoring.test.ts (10 tests)
- ✅ 编写 Phase 2 测试: token-budget.test.ts (13 tests)
- ✅ 编写 Phase 2 测试: hybrid.test.ts (8 tests)
- ✅ 编写 Phase 3 测试: community-advanced.test.ts (13 tests)
- ✅ 编写 Phase 3 测试: builder.test.ts (9 tests)
- ✅ 编写 Phase 3 测试: community-filter.test.ts (6 tests)

**总计**: 70 个测试用例全部通过（250 assertions，1.74s）

---

### ✅ 文档与 Agent 集成（已完成）

**目标**: 面向用户和 Agent 的 GraphRAG 文档

**完成内容**:

- ✅ 创建用户指南 `graphrag-user-guide.md`（根目录）
- ✅ 扩展 `research.txt` 添加 GraphRAG 工具选择、参数指导、使用模式

---

### 🔲 Phase 3.2: 社区分析增强（长期计划）

**目标**: 深化社区分析能力

**计划内容**:

- 🔲 社区间关系分析
- 🔲 社区演化追踪
- 🔲 跨社区桥接节点识别
- 🔲 社区质量评估指标

---

### 🔲 Phase 4: 高级功能（长期计划）

**Phase 4.1: 时序分析**

- 🔲 Atom 创建时间线分析
- 🔲 研究进展追踪
- 🔲 知识演化可视化

**Phase 4.2: 推荐系统**

- 🔲 基于社区的 atom 推荐
- 🔲 相关研究推荐
- 🔲 缺失关系推荐

**Phase 4.3: 可视化**

- 🔲 社区结构可视化
- 🔲 知识图谱交互式浏览
- 🔲 关系强度热力图

---

### 🔲 Phase 5: Memory Subagent（长期计划）

**目标**: 创建专门的 memory 子代理负责维护和操作 atom graph

**计划内容**:

- 🔲 **Memory Agent 定义**: 在 agent.ts 中注册 mode="subagent" 的 memory agent
- 🔲 **Memory Agent Prompt**: 编写 memory.txt 系统提示，涵盖 CRUD、检索、分析、质量检查
- 🔲 **Research Agent 集成**: 在 research.txt 中添加 delegation 指导
- 🔲 **专属分析工具**: `memory_analyze` 工具（社区分析、中心节点、缺口识别）
- 🔲 **主动建议机制**: 操作后建议相关关系、发现重复、识别矛盾
- 🔲 **图谱健康检查**: 孤立节点检测、类型错误检查、缺失关系建议

**设计要点**:

- Memory agent 拥有全部 atom CRUD 工具 + graphRAG 工具
- 通过 task tool 被 research agent 调用
- 负责：批量创建 atoms、图谱清理、模式检测、质量保障
- 不做研究决策，只做图谱操作

---

## 待完成任务

### 已完成 ✅

- ✅ 编写 Phase 2 的测试用例（70 个测试全部通过）
- ✅ 修复 Phase 3.1 单元测试的数据库依赖问题
- ✅ 创建用户指南文档
- ✅ 扩展 agent 系统提示

### 中优先级

- 🔲 集成真实的 embedding API（OpenAI/HuggingFace）
- 🔲 增量更新机制
- 🔲 在真实 Atom Graph 上测试社区检测
- 🔲 性能测试和优化

### 长期

- 🔲 Phase 3.2 社区分析增强
- 🔲 Phase 4 高级功能
- 🔲 Phase 5 Memory Subagent
- 🔲 可视化界面

---

## 使用示例

### Phase 2 Smart Tool

```typescript
// 自然语言查询
await tool.execute({
  query: "如何提升模型训练的稳定性？",
  maxTokens: 4000,
  diversityWeight: 0.3,
  template: "graphrag",
})

// 混合模式（查询 + 指定起点）
await tool.execute({
  query: "优化算法收敛性",
  atomIds: ["atom-123"],
  maxDepth: 2,
  maxAtoms: 10,
})

// Phase 1 兼容模式
await tool.execute({
  atomIds: ["atom-123"],
  maxDepth: 2,
  maxAtoms: 10,
})
```

### Phase 3.1 社区检测

```typescript
// 检测社区
const cache = await detectCommunities({ minCommunitySize: 2 })

// 查询社区
const communities = await queryCommunities({
  query: "深度学习优化方法",
  topK: 5,
})

// 在智能工具中使用社区过滤
await tool.execute({
  query: "模型优化",
  communityIds: ["community-1", "community-3"],
  maxAtoms: 10,
})
```

---

## 技术栈

- **图算法**: BFS 遍历, Louvain 社区检测
- **语义搜索**: Embedding + 余弦相似度
- **评分系统**: 多维度加权评分
- **缓存**: 文件缓存（embedding, community）
- **依赖**: graphology, graphology-communities-louvain

---

## 文档

- `graphrag-user-guide.md` - 用户指南（根目录，面向研究人员）
- `docs/atom-graph-prompt-usage.md` - 技术使用指南（包含 Phase 1-3.1）
- `docs/atom-graph-prompt-phase2-test-design.md` - Phase 2 测试设计
- `docs/atom-graph-prompt-progress.md` - 开发进展记录
- `packages/opencode/src/agent/prompt/research.txt` - Agent GraphRAG 使用指导

---

最后更新: 2026-04-11
