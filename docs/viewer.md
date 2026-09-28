# Viewer 3D：BATCH 0 技术结论

## 决策

采用 **Three.js** 绘制参数化钢筋；BATCH 0 不加入 That Open Components。Geometry Engine 输出毫米制的 `RebarGeometry`，Viewer 只把中心线的直线与严格圆弧转换为 `CurvePath`，再用 `TubeGeometry` 按钢筋直径生成可点选网格。渲染层不能推算锚固、弯钩或任何 22G101 条款。

That Open Components 的 `Worlds`、`SimpleScene`、`SimpleCamera`、`SimpleRenderer` 可管理 BIM 世界；源码还提供 `Clipper`、拾取等组件。当前单构件原生网格不需要其 Fragments、IFC 管线或组件生命周期。未来出现多模型、大场景/IFC 联动需求时，在适配层重新评估；不得把它引入 Rule Engine。[That Open 项目说明](https://github.com/ThatOpen/engine_components)；[组件源码结构](https://github.com/ThatOpen/engine_components/blob/main/CONTRIBUTING.md)。

## 输入和输出

- 输入：`@g101/geometry-engine` 的 `RebarGeometry`，`centerline: LineSegment | ArcSegment[]`，长度与直径单位 **mm**。法线、圆心、扫角由几何引擎给出。Viewer 拒绝零长度线、断开的段、非法圆弧和非法直径。
- 输出：每根钢筋一个 `THREE.Mesh`，`mesh.userData.rebarId` 保存原 ID，便于 Raycaster 拾取后映射钢筋数据与 Evidence；`createRebarGroup` 收集多个网格；`disposeRebarGroup` 释放 GPU 几何与材质。Viewer 不接受 Evidence 或条文文本。
- 使用 `LineCurve3` 与自定义精确圆弧 `Curve<Vector3>` 组成 `CurvePath`。不使用 Catmull-Rom：它可能改写原本笔直的段。`TubeGeometry` 沿曲线生成圆截面，默认径向 12 段、轴向目标边长 12 mm，可由设备档位调整。[TubeGeometry 文档](https://threejs.org/docs/pages/TubeGeometry.html)。
- 当前 TubeGeometry 的自由端是敞口；在可见截口/高质量导出中需要端盖，复杂闭合路径需进一步校验接缝、法向与自交。

## 功能分层

| 能力 | 实现位置 | BATCH 0 状态 |
|---|---|---|
| Scene / Camera / Orbit / Pan / Zoom | Three.js Scene、PerspectiveCamera、OrbitControls | 官方 API 核查，尚未集成页面 |
| Selection / Highlight | Raycaster 命中 `Mesh` → `rebarId`，材质状态由 UI 管理 | 仅 mesh ID 接口实现 |
| Transparency / Hide / Isolate | 材质 `transparent`/`opacity`、网格 `visible` | 待交互集成 |
| Clipping / Section | WebGLRenderer 全局 `clippingPlanes` 或局部材质剪裁 | 官方 API 核查，截面盖帽待验证 |
| Explode / Dimension / Label | UI 或附加 Scene 对象，不能回写工程几何 | BATCH 1 以后 |
| Mobile | 指针/触控交互、容器尺寸更新、限制像素比与管段数 | 架构要求，实机验证未做 |
| Performance | 缓存路径、离屏重建后释放旧对象；监测 `renderer.info.render.calls` 和三角面数 | 指标规划，尚无浏览器基准 |

轨道、缩放、平移见 [OrbitControls](https://threejs.org/docs/pages/OrbitControls.html)；点选见 [Raycaster](https://threejs.org/docs/pages/Raycaster.html)；裁切与性能统计见 [WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html)。Three.js WebGLRenderer 使用 WebGL 2，因此应提供 WebGL 2 不可用的 UI 提示。

## 技术验证边界

包内最小验证是 `buildRebarGeometry` 输出直接进入 `createRebarMesh`，检查中心线端点、有限坐标、顶点缓冲与 `rebarId`；仅可称为 **无 WebGL 的几何适配验证**。BATCH 0 不应把静态 HTML 占位页面或纯 Node 中创建网格称为“浏览器渲染通过”。浏览器端需要在后续批次运行 Playwright 和移动设备验证帧率、画质、裁切、触控。建议测试规模 100 / 1,000 根钢筋，记录设备、浏览器、冷启动时间、draw calls、三角形数、帧时间和显存；不预设未经测量的性能数值。

## 许可证

Three.js 为 MIT；[官方仓库许可证](https://github.com/mrdoob/three.js/blob/master/LICENSE)。That Open Components 为 MIT；[官方许可证](https://github.com/ThatOpen/engine_components/blob/main/LICENSE.md)。本批没有加入 That Open 依赖。
