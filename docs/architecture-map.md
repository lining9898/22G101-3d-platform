# 项目架构图

## 运行时数据流

```mermaid
flowchart LR
    E[Evidence 元数据与审核状态] --> R[22G101 Rule Engine]
    P[构件与节点参数] --> R
    R --> D[ReinforcementDefinition]
    D --> G[Geometry Engine]
    G --> V[Viewer 3D]
    V --> W[Web 工作台]
    E -. Evidence IDs .-> W

    classDef contract fill:#eef6ff,stroke:#3478c0,color:#17324d;
    class E,R,D,G,V,W,P contract;
```

依赖只沿箭头方向流动。Evidence 记录来源与审核状态；Rule Engine 解释规则；Geometry Engine 生成纯几何；Viewer 负责显示；Web 负责交互编排。

## 仓库地图

| 路径 | 职责 | 主要消费者 |
| --- | --- | --- |
| `packages/schemas/` | 跨层 TypeScript 数据契约 | Rule、Geometry、Web、QA |
| `packages/g101-rule-engine/` | 参数校验、规则匹配和钢筋定义输出 | Web、QA |
| `packages/geometry-engine/` | 钢筋中心线直线/圆弧几何 | Viewer、QA |
| `packages/viewer-3d/` | Three.js 几何适配和对象身份 | Web、QA |
| `apps/web/` | 参数输入、状态展示和 3D 工作台 | 最终用户 |
| `data/22g101/` | 可公开的结构化规则元数据 | Rule、Evidence、QA |
| `tests/` | 跨包、规则覆盖与回归测试 | CI、总工程师 |
| `docs/` | 决策、边界、来源与验收说明 | 所有参与者 |
| `agents/` | Agent 角色入口和历史交接 | 所有 Agent |

## 协作控制流

```mermaid
flowchart TD
    O[项目负责人启动 Batch] --> A[总工程师冻结任务与接口]
    A --> S1[专业 Agent 独立 worktree]
    A --> S2[Evidence / QA 独立复核]
    S1 --> H[标准交接报告]
    S2 --> H
    H --> I[总工程师按依赖顺序集成]
    I --> Q[完整质量门禁]
    Q -->|通过| M[main / GitHub Actions]
    Q -->|失败| F[退回责任 Agent 修复]
    F --> H
```

总工程师协调集成，但不能替代独立 Evidence 审核。任何 Agent 都不能自行宣布未启动的 Batch 已开始。
