# BATCH 0 前端架构

`apps/web` 是 Vite + React + TypeScript 的最小工作台。桌面端按构件导航、三维预览、参数及依据分三栏；窄屏改为上下排列，构件导航横向滚动，输入框适配触屏。宽度和高度输入仅为界面演示，绝不生成构造结论。

## 依赖方向

页面将只调用应用层 adapter：`ComponentParameters → G101 Rule Engine → RebarDefinition → Geometry Engine → Viewer`。规则和证据来源留在独立包中，React 不实现条文条件、钢筋路径和三维生成。Viewer 当前用诚实的空状态占位，不画伪钢筋。后续接入实际 Viewer 时须由它消费几何输出契约；参数在规则和输入校验完成前不得驱动伪计算。

## 下一批接入点

1. 由架构 Agent 确定公共 schema 和 adapter 契约后再引入工作区包引用。
2. 用规则返回的模型状态驱动三维视口，依据状态始终显示 `UNVERIFIED`、`REVIEW_REQUIRED` 或 `VERIFIED`，没有证据时禁止显示已验证。
3. 引入节点选择、Zod 参数校验及状态持久化；手机上验证三维触控和平移/缩放与页面滚动的冲突。

本批不包含 22G101 正文、页码、构造公式、钢筋模型或有效的工程计算能力。
