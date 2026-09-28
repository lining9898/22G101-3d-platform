# BATCH 0 依赖许可证核查

基于 `npm ci` 安装后的直接依赖 `package.json`，记录于 2026-09-28。确切分发义务应以锁定版本的完整许可证文本为准。

| 依赖 | 已安装版本 | 许可证 | 用途 |
| --- | --- | --- | --- |
| react / react-dom | 18.3.1 | MIT | Web UI |
| three | 0.180.0 | MIT | 3D 几何显示 |
| vite | 6.4.3 | MIT | Web 构建 |
| @vitejs/plugin-react | 4.7.0 | MIT | React 构建插件 |
| typescript | 5.9.3 | Apache-2.0 | 类型检查 |
| vitest | 3.2.7 | MIT | 测试 |
| eslint / @eslint/js | 9.39.5 | MIT | 代码检查 |
| typescript-eslint | 8.70.1 | MIT | TypeScript 检查 |
| @types/three | 0.180.0 | MIT | 类型声明 |
| @types/react / @types/react-dom | 18.3.31 / 18.3.7 | MIT | 类型声明 |

当前没有引入 That Open、FreeCAD Reinforcement、web-ifc 或 IfcOpenShell 的代码与依赖。开源项目候选许可证及风险见 [开源选型报告](open-source-report.md)。本项目本身目前没有 `LICENSE` 文件；公开可读并不自动授予复用权，确定仓库许可证须由仓库所有者决定。
