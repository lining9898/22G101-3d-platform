# BATCH 0 架构与职责

## 分层契约

| 层 | 输入 | 输出 | 边界 |
| --- | --- | --- | --- |
| Evidence | 人工核对的来源元数据 | Evidence 记录及复核状态 | 只记录来源与审核流程，不生成构造尺寸 |
| G101 Rule Engine | 构件、节点、参数、带 evidenceIds 的规则 | ReinforcementDefinition | 无 React、Three.js 依赖；无已核实真实规则 |
| Geometry Engine | 钢筋定义中的中心线参数 | 毫米制直线/圆弧中心线 | 不推定保护层、锚固、弯钩或图集取值 |
| Viewer | 几何路径和身份 ID | Three.js 交互场景 | 不解释图集规则；渲染器可替换 |
| Web | 用户选择与参数 | 参数编辑、状态与 3D 展示 | UI 不实现规则判断；移动端布局可用 |

真实资料必须先完成来源合法性检查和人工核对，再考虑录入对应规则。`VERIFIED` 规则必须绑定已核对的证据和测试。BATCH 0 保持真实 VERIFIED 规则数为 0。

## 技术选型

采用 npm workspaces、TypeScript、Vite、React 与 Three.js。规则和几何 API 应保持纯数据；That Open Components 暂不作为运行时基础。FreeCAD Reinforcement 仅参考参数到路径的分层思想，不复制代码；IFC 适配器按需留待后续阶段。详细比较见开源选型报告。

## Agent 工作边界

| Agent | 所有权 | 交接物 |
| --- | --- | --- |
| 0 Architect | 根工作区、公共集成、最终验收 | 统一 Schema、集成提交与验收 |
| 1 OpenSource | `docs/open-source-report.md` | 许可与技术决策建议 |
| 2 Evidence | `packages/schemas/src/evidence.ts` | evidenceIds 与复核状态 |
| 3 Rules | `packages/schemas/src/domain.ts`、规则包 | ReinforcementDefinition |
| 4 Geometry | 几何包 | 中心线与圆弧输出 |
| 5 Viewer | Viewer 包 | 路径渲染适配器 |
| 6 Frontend | `apps/web` | 响应式页面与空状态 |
| 7 QA | `tests`、CI | 验证规则覆盖检查与质量门禁 |

各 Agent 在独立 worktree 和分支完成提交。Architect 审查提交、集成并运行完整门禁；公共 Schema 更改须由 Architect 审核。推荐未来分支命名 `agent/<role>`，不把代理分支当作发布版本。
