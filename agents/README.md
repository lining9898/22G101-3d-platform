# Agent handoff

BATCH 0 已封板。Agent 0 统一根工作区、公共 Schema、集成测试与 Git；Agent 1 负责开源调研；Agent 2 负责 Evidence；Agent 3 负责 Rule Engine；Agent 4 负责几何；Agent 5 负责 Viewer；Agent 6 负责前端；Agent 7 负责 QA。各模块说明位于 `docs/`。

后续协作从 `main` 创建独立工作树和 `agent/<role>` 分支。修改公共契约前先向 Agent 0 提议；先交接输入输出，再改消费者。未经人工核对的 22G101 事实不能标为 VERIFIED。

仓库级约束以根目录 [AGENTS.md](../AGENTS.md) 为准；任务单、交接格式和冲突处理见 [多 Agent 协作规范](../docs/collaboration.md)。未由项目负责人明确启动前，不得进入 BATCH 1。
