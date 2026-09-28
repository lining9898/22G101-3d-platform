import { useState } from 'react';

const componentNames = ['梁', '柱', '剪力墙', '板', '楼梯', '基础'] as const;
type ComponentName = (typeof componentNames)[number];

export default function App() {
  const [component, setComponent] = useState<ComponentName>('梁');
  const [width, setWidth] = useState('300');
  const [height, setHeight] = useState('600');

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">G</span>
          <div>
            <p className="eyebrow">PARAMETRIC REINFORCEMENT · BATCH 0</p>
            <h1>22G101 参数化钢筋构造</h1>
          </div>
        </div>
        <span className="stage-badge">架构演示 · 无已核验规则</span>
      </header>

      <div className="notice" role="status">
        当前仅展示界面骨架。尚未录入 22G101 规则，输入尺寸不会生成钢筋，也不能作为设计依据。
      </div>

      <main className="workspace">
        <nav className="sidebar panel" aria-label="构件导航">
          <div className="panel-title"><span>01</span> 选择构件</div>
          <div className="component-list">
            {componentNames.map((name) => (
              <button
                key={name}
                type="button"
                className={name === component ? 'component active' : 'component'}
                aria-current={name === component ? 'page' : undefined}
                onClick={() => setComponent(name)}
              >
                <span className="component-glyph" aria-hidden="true">{name.slice(0, 1)}</span>
                <span>{name}</span>
                <span className="component-arrow" aria-hidden="true">›</span>
              </button>
            ))}
          </div>
          <p className="sidebar-note">构件入口仅用于展示页面结构；节点选择和参数化规则将在后续批次接入。</p>
        </nav>

        <section className="viewport panel" aria-labelledby="viewport-title">
          <div className="viewport-header">
            <div>
              <div className="panel-title"><span>02</span> 三维视图</div>
              <h2 id="viewport-title">{component} · 模型预览</h2>
            </div>
            <span className="status-chip">VIEWER 待接入</span>
          </div>
          <div className="canvas-placeholder" role="img" aria-label="三维视图占位；当前没有钢筋模型">
            <div className="grid-plane" aria-hidden="true" />
            <div className="empty-model">
              <div className="model-icon" aria-hidden="true">◇</div>
              <strong>等待几何引擎输出</strong>
              <span>后续将由 Rule Engine → Rebar Definition → Geometry Engine → Viewer 驱动</span>
            </div>
            <span className="axis-mark">X · Y · Z</span>
          </div>
          <div className="viewport-footer">
            <span>未加载三维几何</span>
            <span>选择钢筋、剖切和标注功能待开发</span>
          </div>
        </section>

        <aside className="inspector panel" aria-label="参数与证据">
          <div className="panel-title"><span>03</span> 参数与依据</div>
          <div className="inspector-section">
            <h2>构件参数 <small>界面演示</small></h2>
            <p className="helper">输入值仅保留在当前页面；尚未执行构造计算。</p>
            <label htmlFor="member-width">截面宽度 <span>mm</span></label>
            <input id="member-width" type="number" min="1" inputMode="numeric" value={width} onChange={(event) => setWidth(event.target.value)} />
            <label htmlFor="member-height">截面高度 <span>mm</span></label>
            <input id="member-height" type="number" min="1" inputMode="numeric" value={height} onChange={(event) => setHeight(event.target.value)} />
          </div>
          <div className="inspector-section">
            <h2>钢筋定义</h2>
            <div className="empty-state">暂无钢筋定义。规则引擎接入后显示类型、直径、路径和数量。</div>
          </div>
          <div className="inspector-section evidence">
            <div className="evidence-heading"><h2>图集依据</h2><span>UNVERIFIED</span></div>
            <p>尚未上传或人工核对原始图集。当前没有条文、页码或节点依据。</p>
          </div>
        </aside>
      </main>
    </div>
  );
}
