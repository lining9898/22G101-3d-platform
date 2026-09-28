# Agent 协作规则

本文件适用于整个仓库，是 Codex、豆包、Work Buddy 及其他自动化 Agent 进入项目后的首要协作说明。更深目录中的 `AGENTS.md` 可以增加局部规则，但不能放宽本文件的工程、安全与证据要求。

## 当前阶段

- BATCH 0 已封板，基线提交为 `261aed1fb3d8d13e1e13930aca288aa46a9ced57`。
- BATCH 0 的 Windows 测试兼容提交为 `552919e80fd2225b6008ec6871f72606296114c1`。
- BATCH 0.5 仅建立文档和协作规则，不开发产品功能。
- 未经项目负责人明确启动，不得进入 BATCH 1。

## 不可违反的边界

1. 不把未经人工核对的 22G101 内容、尺寸、公式或构造结论标记为 `VERIFIED`。
2. 不向公开仓库提交图集 PDF、扫描页、大段原文、密钥、令牌或个人数据。
3. Web 和 Viewer 不实现规范判断；Geometry Engine 不推断规则值；Rule Engine 不生成证据状态。
4. 公共 Schema 的更改必须先说明生产者、消费者、迁移方式和兼容影响，由总工程师批准后实施。
5. 不修改他人工作树中的未提交内容，不使用 `git reset --hard`、强制推送或覆盖式操作处理冲突。
6. 一个任务只处理已批准的阶段和范围。发现跨阶段依赖时停止扩展并交回总工程师决策。

## 角色与所有权

| 角色 | 主要所有权 | 不得自行决定 |
| --- | --- | --- |
| 总工程师 / Architect | 公共契约、任务拆分、集成顺序、最终验收 | 不能替代 Evidence 人工核验 |
| Geometry Agent | `packages/geometry-engine/` | 规则阈值、保护层、锚固或弯钩取值 |
| Viewer Agent | `packages/viewer-3d/` | 规则解析、证据审核、工程结论 |
| Web Agent | `apps/web/` | 在 UI 内复制规则和几何算法 |
| Rule Agent | `packages/g101-rule-engine/`、规则草案 | 将无证据规则标为已验证 |
| Evidence Agent | Evidence 元数据和审核交接 | 由描述文本推导工程规则 |
| QA Agent | `tests/`、质量门禁和回归报告 | 为通过测试而改写业务语义 |
| Documentation Agent | `README.md`、`docs/`、协作文件 | 宣称尚未实现或验证的能力 |

路径所有权用于明确主责，不代表 Agent 可以跳过接口评审。跨两个以上模块的任务由总工程师先拆分接口和集成顺序。

## 标准工作流

1. 从最新 `main` 创建独立 worktree 和 `agent/<role>/<short-task>` 分支。
2. 开工前记录任务目标、允许修改的路径、禁止项、输入契约、输出契约和验收命令。
3. 先提交最小契约变更，再由各消费者分别实现；禁止多个 Agent 同时编辑同一公共文件。
4. 每个提交只包含一个可解释目的，提交信息采用 `<type>(<scope>): <summary>`。
5. 交接前执行与改动相关的最小测试；进入集成队列前执行完整质量门禁。
6. 通过 PR 交给总工程师集成。PR 必须说明事实来源、风险、未完成项和实际测试结果。
7. 总工程师按依赖顺序合并，重新运行完整门禁，并确认 `main` 工作区干净。

完整交接格式和冲突处理见 [多 Agent 协作规范](docs/collaboration.md)。

## 质量门禁

代码、测试、依赖或运行配置进入 `main` 前必须通过：

```text
npm ci
npm run typecheck
npm run lint
npm test
node tests/verify-rule-coverage.mjs
npm run build
```

报告必须写明真实执行结果。环境问题、跳过项和失败项要单独列出，不能用“应当通过”代替结果。

纯 Markdown 文档或 PR/Issue 模板改动至少执行链接、路径范围和 `git diff --check` 检查；推送后仍以 GitHub Actions 结果作为仓库最终状态。

## 文档与事实

- 软件实现说明应链接到对应代码或测试。
- 22G101 事实必须关联可追溯 Evidence ID、版本、页码或节点、审核人和审核时间。
- 示例数据必须标明 `synthetic`、`illustrative` 或 `UNVERIFIED`，不得让用户误认为工程依据。
- Agent 输出是草案或实现，不构成人工规范审核。

## 完成定义

任务只有在范围内文件完成、相关测试通过、交接信息完整、无意外生成物且未越过阶段边界时才算完成。无法满足时应报告唯一阻塞原因，保留可审查状态并停止扩展。
