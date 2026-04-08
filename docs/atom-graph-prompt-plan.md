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

### 🔲 Phase 3.2: 社区分析增强（待实施）

**目标**: 深化社区分析能力

**计划内容**:

- 🔲 社区间关系分析
- 🔲 社区演化追踪
- 🔲 跨社区桥接节点识别
- 🔲 社区质量评估指标

---

### 🔲 Phase 4: 高级功能（未开始）

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

## 待完成任务

### 高优先级

- 🔲 编写 Phase 2 的 33 个测试用例
- 🔲 修复 Phase 3.1 单元测试的数据库依赖问题
- 🔲 性能测试和优化

### 中优先级

- 🔲 集成真实的 embedding API（OpenAI/HuggingFace）
- 🔲 增量更新机制
- 🔲 Phase 3.2 社区分析增强

### 低优先级

- 🔲 Phase 4 高级功能
- 🔲 可视化界面
- 🔲 分布式缓存支持

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

- `atom-graph-prompt-usage.md` - 使用指南（包含 Phase 1-3.1）
- `atom-graph-prompt-phase2-test-design.md` - Phase 2 测试设计
- `progress.md` - 开发进展记录

---

最后更新: 2026-04-08
