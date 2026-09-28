# 多 Agent 协作规范

本规范把任务拆分、交接和集成变成可复核流程。总工程师是唯一集成协调者；各专业 Agent 对自己的交付物负责，但不跨越模块边界代替其他角色作结论。

## 任务单

总工程师分派任务时应包含以下字段：

```text
Batch:
Owner:
Goal:
Allowed paths:
Forbidden changes:
Inputs / contracts:
Expected outputs:
Acceptance commands:
Dependencies:
Stop conditions:
```

缺少输入契约时，Agent 可以先做只读调查和提出接口草案；不得自行扩大业务范围。

## 并行原则

- 每个 Agent 使用独立 worktree 和分支。
- 一个公共文件在同一时间只由一个 Agent 负责编辑。
- 可以并行实现已冻结契约的消费者；生产者接口未冻结前，消费者只提交适配草案。
- 公共 Schema、规则格式和 ID 约定由总工程师串行集成。
- QA 可以并行准备测试设计，但验证真实规则时必须等待 Evidence 审核结果。

## 交接协议

Agent 完成任务后，用以下格式交接：

```text
Task:
Branch / commit:
Changed paths:
Contract changes:
Evidence status:
Checks run and results:
Known risks:
Unfinished items:
Recommended integration order:
```

“检查通过”必须对应实际命令输出。未运行的检查写 `NOT RUN`，失败写出首个确定错误，不猜测原因。

## 集成顺序

通常按下列顺序进入集成队列：

1. 公共 Schema 与稳定 ID；
2. Evidence 元数据和审核状态；
3. Rule Engine 输出契约；
4. Geometry Engine；
5. Viewer 适配；
6. Web 集成；
7. QA、文档与完整回归。

若任务不涉及某层，可跳过该层；不能反转依赖方向。例如 Web 不能先内置临时规则，再要求 Rule Agent 追认。

## 冲突处理

1. Agent 停止编辑冲突文件，并保留自己的提交。
2. 向总工程师报告双方提交、冲突路径和各自契约意图。
3. 总工程师指定唯一解决者和目标契约。
4. 解决者基于最新集成分支处理冲突，重新执行相关门禁。

禁止用强制推送、覆盖文件或删除测试来消除冲突。

## 决策记录

以下变更需要在 PR 或 `docs/` 中记录原因：

- 新增或替换核心依赖；
- 修改公共 Schema、单位、坐标系或 ID；
- 改变 Evidence/Rule 状态机；
- 改变模块所有权或依赖方向；
- 放宽质量门禁或安全边界。

记录至少包含背景、选择、被否决方案、兼容影响和验证方式。

## 阶段门

每个 Batch 必须由项目负责人明确启动。阶段结束时，总工程师确认：范围内目标完成、完整门禁通过、GitHub 状态正常、工作区干净、遗留项已记录。未启动的下一阶段只能写计划，不能提交功能实现。
