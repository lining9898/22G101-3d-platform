# BATCH 0 Agent handoff

Agent 0 统一根工作区、公共 Schema、集成测试与 Git；Agent 1 负责开源调研；Agent 2 负责 Evidence；Agent 3 负责 Rule Engine；Agent 4 负责几何；Agent 5 负责 Viewer；Agent 6 负责前端；Agent 7 负责 QA。各模块说明位于 `docs/`。

后续协作从 `main` 创建独立工作树和 `agent/<role>` 分支。修改公共契约前先向 Agent 0 提议；先交接输入输出，再改消费者。未经人工核对的 22G101 事实不能标为 VERIFIED。
