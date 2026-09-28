# 22G101 参数化钢筋构造 3D 可视化平台

本仓库已完成 **BATCH 0 基础架构**，并在 **BATCH 0.5** 建立多 Agent 协作规则。目前没有录入 22G101 真实构造规则；演示界面及几何 API 不能作为设计、审图或施工依据。BATCH 1 尚未启动。

## 本地运行

需要 Node.js 22。执行 `npm ci`，然后 `npm run dev`。基础门禁依次为 `npm run typecheck`、`npm run lint`、`npm test`、`npm run build`。CI 对每次提交重复执行。

## 数据流

`Evidence → Rule → Component Parameters → ReinforcementDefinition → Geometry Engine → Viewer → Web`

规则、证据和几何是独立 TypeScript 包；Web 不包含规范阈值或构造判断。有关分层、规则状态和并行工作边界见 [架构](docs/architecture.md)、[架构图](docs/architecture-map.md)、[证据](docs/evidence.md)、[QA](docs/qa.md) 和 [开源选型](docs/open-source-report.md)。

## 协作入口

人工贡献者和所有 Agent 开工前必须阅读 [AGENTS.md](AGENTS.md)、[贡献指南](CONTRIBUTING.md) 与 [多 Agent 协作规范](docs/collaboration.md)。PR 使用仓库模板记录范围、Evidence 状态、实际检查结果和集成顺序。总工程师统一公共契约与最终集成，各专业 Agent 使用独立 worktree 和分支交付。

公开仓库不存放图集 PDF、扫描页或受限原文。原始资料放在 `.gitignore` 排除的私有目录。
