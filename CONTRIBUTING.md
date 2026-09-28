# 贡献指南

本项目同时接受人工贡献与 Agent 辅助贡献。所有贡献者先阅读 [Agent 协作规则](AGENTS.md)、[架构图](docs/architecture-map.md) 和 [多 Agent 协作规范](docs/collaboration.md)。

## 开始前

1. 确认当前批次、任务负责人和允许修改的路径。
2. 从最新 `main` 创建独立 worktree 与短生命周期分支。
3. 分支使用 `agent/<role>/<short-task>` 或 `docs/<short-task>`。
4. 涉及公共 Schema、跨包接口或真实 22G101 数据时，先提交设计说明并等待总工程师批准。

## 提交要求

- 保持改动单一、可回滚，不混入格式化或无关重构。
- 推荐提交格式：`feat(scope): ...`、`fix(scope): ...`、`test(scope): ...`、`docs(scope): ...`、`chore(scope): ...`。
- 不提交 `node_modules/`、构建产物、原始图集、扫描件、密钥或本地 Agent 缓存。
- 文档中的实现状态必须与仓库一致；未来计划使用“计划”“待验证”等明确措辞。

## 22G101 数据要求

公开规则记录放在 `data/22g101/rules/**/*.json`。任何 `VERIFIED` 规则都必须具有：

- 唯一且安全的规则 ID；
- 已独立人工核对的 Evidence 记录；
- 明确的版本、页码或节点定位；
- 对应的 `tests/verified-rules/<id>.test.ts` 回归测试；
- PR 中记录的审核人与核对结论。

缺少任一项时，规则保持 `UNVERIFIED` 或 `REVIEW_REQUIRED`。

## 本地检查

首次安装和代码改动的完整验收使用：

```bash
npm ci
npm run typecheck
npm run lint
npm test
node tests/verify-rule-coverage.mjs
npm run build
```

修复失败时先判断是代码、测试、依赖还是运行环境问题。不得通过删除断言、降低证据状态要求或跳过 CI 来获得绿色结果。

仅修改 Markdown 或 PR/Issue 模板时，至少检查相对链接、改动路径和 `git diff --check`，并在 PR 中将未运行的代码门禁标为 `NOT RUN (docs-only)`。

## Pull Request

PR 应保持小而完整，并填写仓库模板。至少包含：

- 目标与范围；
- 修改和未修改的模块；
- 接口或数据兼容影响；
- 实际执行的检查及结果；
- Evidence 状态和来源说明；
- 风险、后续任务与回滚方式。

总工程师负责确认依赖顺序、公共契约和最终门禁。作者不能把自己的实现检查视为独立 Evidence 审核。
