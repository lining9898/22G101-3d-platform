# BATCH 0 开源技术选型报告

调查日期：2026-09-28。以下星标与活动信息是调查时的快照，会随时间变化；来源为项目官方仓库、源码及官方文档。`未核实` 表示未取得可信的最近提交日期，不能推断项目停止维护。本报告没有引入第三方源码，也没有把任何候选项目视作 22G101 规则依据。

## 候选项目比较

| repository | license | language / framework | lastActivity | stars | parametricRebar | webSupport | IFCSupport | reusableModules | risks |
| --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- |
| [mrdoob/three.js](https://github.com/mrdoob/three.js) | [MIT](https://github.com/mrdoob/three.js/blob/dev/LICENSE) | JavaScript / WebGL、WebGPU | 2026-09-21 可见提交（[提交记录](https://github.com/mrdoob/three.js/commits/dev/)） | 约 116k | 无钢筋规则；[TubeGeometry](https://threejs.org/docs/pages/TubeGeometry.html) 接受曲线、半径、分段参数 | 原生 Web | 本身不解析 IFC | 场景、相机、材质、拾取、路径扫掠 | 大量独立 mesh 带来绘制与拾取压力；管状截面、弯曲半径、封口需验证；升级版本有 API 变更 |
| [ThatOpen/engine_components](https://github.com/ThatOpen/engine_components) | [MIT](https://github.com/ThatOpen/engine_components/blob/main/LICENSE.md) | TypeScript / Three.js | [组织页](https://github.com/ThatOpen) 显示更新于 2026-09-25 | 约 706 | 无 22G101 配筋规则 | 浏览器核心/前端扩展 | 可配合该生态的 IFC、Fragments | Worlds、相机、渲染器、Highlighter、BIM 交互 | 包与工作线程、Fragments 等版本要兼容；对纯钢筋细节可能增加不必要的依赖和抽象；先独立验证再引入 |
| [amrit3701/FreeCAD-Reinforcement](https://github.com/amrit3701/FreeCAD-Reinforcement) | 源文件注明 [LGPL-2.0-or-later](https://github.com/amrit3701/FreeCAD-Reinforcement/blob/master/LShapeRebar.py)；逐文件使用前复核 | Python / FreeCAD、Qt、OpenCascade | 最近提交日期未核实；仓库仍公开 | 约 66 | 有直筋、L、U、弯折、箍筋和梁柱板基础配筋功能 | 无原生 Web | 依赖 FreeCAD/BIM 生态，不能等同独立 IFC Web 支持 | 参数映射至点集、Sketch、分布数量等设计思路 | 重度依赖 FreeCAD 对象、宿主面和 GUI；移植成本高，直接复制还需遵守 LGPL 和逐文件版权；非中国图集依据 |
| [ThatOpen/engine_web-ifc](https://github.com/ThatOpen/engine_web-ifc) | [MPL-2.0](https://github.com/ThatOpen/engine_web-ifc/blob/main/LICENSE.md) | C++ / TypeScript / WASM | [组织页](https://github.com/ThatOpen) 显示更新于 2026-09-27 | 约 1.1k | 无本项目配筋规则 | 浏览器 WASM | IFC 读写 | `IfcAPI`、几何读取、保存接口 | WASM 包体、内存和 IFC 表达映射；MPL 文件级许可义务；BATCH 0 无 IFC 需求 |
| [IfcOpenShell/IfcOpenShell](https://github.com/IfcOpenShell/IfcOpenShell) | 仓库显示 [LGPL-3.0 与 GPL-3.0 混合](https://github.com/IfcOpenShell/IfcOpenShell)，需逐模块核对 | C++ / Python / OpenCascade | [组织页](https://github.com/IfcOpenShell) 显示更新于 2026-09-25 | 约 2.8k | 可为 IFC 钢筋等实体建模，非 22G101 配筋规则引擎 | 主要为服务端/桌面生态 | 成熟 IFC 解析、生成与几何 | Python API、IfcConvert、几何能力 | 服务端部署与几何内核复杂；模块许可证不同；当前前端纯参数化展示用不到 |

## 源码抽样核查

- FreeCAD 的 [LShapeRebar.py `getpointsOfLShapeRebar`](https://github.com/amrit3701/FreeCAD-Reinforcement/blob/master/LShapeRebar.py) 先从面尺寸、保护层、直径、方向计算中心线点集，随后创建 Sketch 的线段并调用 `Arch.makeRebar`，再设置弯曲、数量、间距等属性。这证明“参数 → 中心线 → 实体/阵列”的分层思路可借鉴，也证明这段实现与 FreeCAD 的宿主结构对象耦合，不能直接作为浏览器 JS 模块使用。
- That Open [Worlds 示例源码](https://github.com/ThatOpen/engine_components/blob/main/packages/core/src/core/Worlds/example.ts) 实际初始化 `Components → Worlds → SimpleScene/SimpleCamera/SimpleRenderer`，并将 `THREE.BoxGeometry` 加入场景；[Highlighter 示例源码](https://github.com/ThatOpen/engine_components/blob/main/packages/front/src/fragments/Highlighter/example.ts) 则使用 `@thatopen/components-front`、Fragments worker 和交互选择。说明这些是 3D/BIM 交互层，不是钢筋规则实现。
- web-ifc 的 [TS API 源码](https://github.com/ThatOpen/engine_web-ifc/blob/main/src/ts/web-ifc-api.ts) 包含 `IfcAPI` 模型读写、WASM 初始化等内容；官方 [README](https://github.com/ThatOpen/engine_web-ifc) 也展示 `OpenModel/CloseModel` 和 WASM 构建依赖。它解决 IFC 数据交换，不解决 22G101 参数与规则。
- Three.js [TubeGeometry 官方文档](https://threejs.org/docs/pages/TubeGeometry.html) 明确构造函数消费 Curve、半径与采样参数，能作为显示层的第一版路径扫掠方案；工程几何正确性及批量性能仍须自己的测试证明。

## 建议技术决策

1. **采用 Three.js 作为 BATCH 0 的浏览器渲染基础。** 规则层及几何输出保持纯 TypeScript 数据结构：钢筋以有序中心线路径（直线段与圆弧段）、直径、实例排布、ID 和追溯元数据表示；渲染器适配为曲线与扫掠网格。此为工程方案，不是已验证的钢筋构造规则。
2. **That Open Components 暂缓作为运行时依赖。** 先用独立适配器验证构件选择、高亮、剖切、移动端帧率和批量钢筋拾取，若对 IFC/BIM 交互有显著收益再纳入。其源码可作设计参考；避免 Rule Engine 依赖该框架。
3. **FreeCAD Reinforcement 仅作为算法与数据流参考，不 Fork、不直接移植。** 若未来确实复制或改造源码，先逐文件复核 LGPL 许可、版权声明、分发义务，并在隔离模块实施；当前从零实现领域数据模型。
4. **web-ifc 延至需要 IFC 导入或导出并明确交换目标时。** 到时验证 `IfcReinforcingBar` / 几何映射、精度与往返测试，作为 `ifc-adapter` 独立包；无需 BATCH 0 安装。
5. **IfcOpenShell BATCH 0 不使用。** 将来服务端 IFC 生成、校验或复杂几何确有需求时与 web-ifc 对照测试，并逐包审查许可证。

## 能力边界与后续验证

独立几何层应输出可序列化的路径（直线、圆弧）、截面直径、放置矩阵或确定性阵列参数；Viewer 只负责绘制和交互。保护层、锚固、搭接、弯钩、箍筋间距等 22G101 取值须由单独的证据与规则层给出，未经人工核对一律 `UNVERIFIED`。测试时分别覆盖路径连接连续性、圆弧切向与弯曲半径、钢筋身份拾取、批量实例性能、低端手机内存和 WebGL 资源释放。

## 活动数据说明

GitHub stars 为四舍五入的页面显示值，不用于选型优先级的唯一判断。FreeCAD Reinforcement 仓库页面没有可靠展示最近一次提交日期，因此明确标记未核实；不将网页爬取日期当成项目活动日期。许可信息来自候选仓库及源码，正式引入依赖时应以锁定版本对应的许可证文件再次核对。
