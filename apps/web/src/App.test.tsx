import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import App from './App';

describe('Batch 0 workspace', () => {
  it('marks evidence as unverified and geometry as unavailable', () => {
    const markup = renderToStaticMarkup(<App />);
    expect(markup).toContain('UNVERIFIED');
    expect(markup).toContain('尚未录入 22G101 规则');
    expect(markup).toContain('未加载三维几何');
  });
});
