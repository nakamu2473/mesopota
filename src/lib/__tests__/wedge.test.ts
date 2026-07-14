import { describe, expect, it } from 'vitest';
import { angleDiff, dragToWedge, normalizeWedges, Wedge } from '../wedge';

describe('dragToWedge', () => {
  it('短いドラッグはウィンケルハーケンになる', () => {
    expect(dragToWedge(50, 50, 52, 52).type).toBe('W');
  });
  it('水平近くのドラッグは H にスナップされる', () => {
    const w = dragToWedge(10, 50, 90, 55);
    expect(w.type).toBe('H');
    expect(w.angle).toBe(0);
  });
  it('垂直近くのドラッグは V にスナップされる', () => {
    const w = dragToWedge(50, 10, 47, 90);
    expect(w.type).toBe('V');
    expect(w.angle).toBe(90);
  });
  it('斜めのドラッグは D になる', () => {
    const w = dragToWedge(10, 10, 80, 80);
    expect(w.type).toBe('D');
    expect(Math.round(w.angle)).toBe(45);
  });
});

describe('angleDiff', () => {
  it('循環を考慮した角度差を返す', () => {
    expect(angleDiff(350, 10)).toBe(20);
    expect(angleDiff(0, 180)).toBe(180);
  });
});

describe('normalizeWedges', () => {
  it('長辺を 100 に合わせて中央寄せする', () => {
    const input: Wedge[] = [{ type: 'H', x: 20, y: 40, length: 40, angle: 0 }];
    const [w] = normalizeWedges(input);
    expect(w.x).toBeCloseTo(0);
    expect(w.length).toBeCloseTo(100);
    expect(w.y).toBeCloseTo(50);
  });
  it('空配列はそのまま返す', () => {
    expect(normalizeWedges([])).toEqual([]);
  });
});
