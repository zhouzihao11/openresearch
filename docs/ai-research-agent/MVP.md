# AI 科研助手 - 第一阶段开发目标（MVP）

## 阶段目标

验证**原子网络 + 实验验证**的核心工作流，构建最小可用版本。

---

## 功能范围

### P0 - 必须包含

| 功能        | 描述                                          |
| ----------- | --------------------------------------------- |
| 课题创建    | 支持名称、研究背景、最终目标                  |
| 原子管理    | 创建、编辑、删除原子                          |
| 原子关系    | 建立 depends_on / supports / contradicts 关系 |
| 知识图谱    | 可视化原子网络，支持交互                      |
| 实验执行    | 触发实验 → 本地执行 → 结果归档                |
| SQLite 存储 | 所有数据持久化到 .research/research.db        |

### P1 - 尽量包含

| 功能       | 描述                           |
| ---------- | ------------------------------ |
| 代码项目   | 添加本地代码目录，实验引用代码 |
| 远程服务器 | SSH 远程执行实验               |

### 不包含（后续阶段）

- 文献管理
- 课题级 AI 对话
- 批量导入
- 里程碑管理

---

## 数据模型（最小）

### 1. 课题表 (projects)

```typescript
export const projects = sqliteTable("research_projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  background: text("background"), // 研究背景
  goal: text("goal"), // 最终目标
  status: text("status").default("active"),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
})
```

### 2. 原子表 (atoms)

```typescript
export const atoms = sqliteTable("research_atoms", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  type: text("type").notNull(), // 'observation' | 'method' | 'hypothesis'
  title: text("title").notNull(),
  content: text("content").notNull(),
  validationJson: text("validation_json").notNull(),
  status: text("status").default("pending"), // 'pending' | 'validating' | 'validated' | 'rejected'
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
})
```

### 3. 原子关系表 (atomRelations)

```typescript
export const atomRelations = sqliteTable("research_atom_relations", {
  id: text("id").primaryKey(),
  sourceAtomId: text("source_atom_id").notNull(),
  targetAtomId: text("target_atom_id").notNull(),
  relationType: text("relation_type").notNull(), // 'depends_on' | 'supports' | 'contradicts'
})
```

### 4. 实验表 (experiments)

```typescript
export const experiments = sqliteTable("research_experiments", {
  id: text("id").primaryKey(),
  atomId: text("atom_id").notNull(),
  status: text("status").default("pending"), // 'pending' | 'running' | 'completed' | 'failed'
  codeJson: text("code_json"), // 引用的代码项目 JSON
  output: text("output"),
  metricsJson: text("metrics_json"),
  startedAt: integer("started_at", { mode: "timestamp" }),
  completedAt: integer("completed_at", { mode: "timestamp" }),
})
```

### 5. 代码项目表 (codeProjects) - P1

```typescript
export const codeProjects = sqliteTable("research_code_projects", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  name: text("name").notNull(),
  path: text("path").notNull(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }),
})
```

### 6. 服务器表 (servers) - P1

```typescript
export const servers = sqliteTable("research_servers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'ssh' | 'docker'
  endpoint: text("endpoint").notNull(),
  credentialsJson: text("credentials_json").notNull(),
  resourcesJson: text("resources_json").notNull(),
})
```

---

## 目录结构

### 服务端 (packages/opencode/src/research/)

```
packages/opencode/src/
└── research/
    ├── index.ts                  # 模块入口
    ├── research.sql.ts          # Drizzle Schema
    ├── routes/
    │   ├── project.ts           # 课题 API
    │   ├── atom.ts              # 原子 API
    │   ├── experiment.ts        # 实验 API
    │   └── server.ts            # 服务器 API
    ├── storage/
    │   └── index.ts             # 数据库操作
    └── services/
        └── experiment.ts        # 实验执行服务
```

### Web UI (packages/app/src/pages/research/)

```
packages/app/src/
└── pages/
    └── research/
        ├── index.tsx             # 课题列表页
        ├── project.tsx           # 课题总览（4栏布局）
        ├── atom.tsx              # 原子编辑页
        └── graph.tsx             # 知识图谱页
```

---

## 实施计划

### Step 1: 项目基础架构 (1周)

**服务端**：

- [ ] 在 `packages/opencode/src/research/` 创建目录结构
- [ ] 配置 Drizzle + SQLite
- [ ] 创建数据库表 (projects)
- [ ] 实现课题 CRUD API

**前端**：

- [ ] 在 `packages/app/src/pages/research/` 创建目录结构
- [ ] 添加科研页面路由

### Step 2: 原子系统 (1周)

**服务端**：

- [ ] 创建 atoms, atomRelations 表
- [ ] 实现原子 CRUD API
- [ ] 实现原子关系 CRUD API
- [ ] 实现依赖检查

**前端**：

- [ ] 原子列表页面
- [ ] 原子创建/编辑页面
- [ ] 关系管理界面

### Step 3: 图谱可视化 (1周)

**服务端**：

- [ ] 提供图谱数据 API

**前端**：

- [ ] 集成 React Flow
- [ ] 渲染原子节点（按类型区分颜色）
- [ ] 渲染关系边（按类型区分样式）
- [ ] 交互功能（点击节点、拖拽）

### Step 4: 实验系统 (1周)

**服务端**：

- [ ] 创建 experiments 表
- [ ] 实现实验 CRUD API
- [ ] 本地执行实验（使用 OpenCode bash tool）

**前端**：

- [ ] 实验列表页面
- [ ] 实验详情页面（输出日志）
- [ ] 触发验证按钮

### Step 5: 远程服务器 - P1 (1周)

**服务端**：

- [ ] 创建 servers 表
- [ ] 实现服务器管理 API
- [ ] SSH 连接池
- [ ] 远程执行实验

**前端**：

- [ ] 服务器配置页面
- [ ] 服务器选择 UI

### Step 6: 集成测试 (1周)

- [ ] 完整工作流测试
- [ ] Bug 修复
- [ ] 文档完善

---

## 交付物

### 1. Web 界面

- 课题创建/编辑页面
- 知识图谱页面（交互式）
- 实验详情页面

### 2. CLI 命令

```bash
# 课题
research init <name>              # 创建课题
research settings                 # 编辑课题设置

# 原子
research atom create            # 创建原子
research atom edit <id>          # 编辑原子
research atom delete <id>       # 删除原子

# 关系
research rel add <src> <tgt> <type>  # 添加关系

# 实验
research validate <atom-id>      # 执行验证

# 服务器 - P1
research server add <name> <endpoint>  # 添加服务器
research server list              # 列出服务器
```

### 3. 数据存储

- `.research/research.db` - SQLite 数据库文件

---

## 预估时间

| 阶段            | 时间    |
| --------------- | ------- |
| 基础架构        | 1周     |
| 原子系统        | 1周     |
| 图谱可视化      | 1周     |
| 实验执行        | 1周     |
| 远程服务器 - P1 | 1周     |
| 集成测试        | 1周     |
| **总计**        | **6周** |

---

## 后续阶段（规划中）

### 第二阶段

- 文献管理模块
- 批量导入功能
- 课题级 AI 对话

### 第三阶段

- 里程碑管理
- 团队协作
