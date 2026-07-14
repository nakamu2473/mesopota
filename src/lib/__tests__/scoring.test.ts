import { describe, expect, it } from 'vitest';
import { scoreWedge, totalScore } from '../scoring';
import { Wedge } from '../wedge';

const target: Wedge = { type: 'H', x: 10, y: 50, length: 80, angle: 0 };

describe('scoreWedge', () => {
  it('ぴったりの楔は満点で合格', () => {
    const r = scoreWedge({ ...target }, target);
    expect(r.ok).toBe(true);
    expect(r.score).toBe(100);
    expect(r.feedback).toBeNull();
  });

  it('多少のずれは許容される', () => {
    const r = scoreWedge({ type: 'H', x: 18, y: 55, length: 70, angle: 8 }, target);
    expect(r.ok).toBe(true);
  });

  it('位置が大きくずれると position フィードバック', () => {
    const r = scoreWedge({ type: 'H', x: 10, y: 90, length: 80, angle: 0 }, target);
    expect(r.ok).toBe(false);
    expect(r.feedback).toBe('position');
  });

  it('向きが違うと angle フィードバック', () => {
    const r = scoreWedge({ type: 'D', x: 10, y: 50, length: 80, angle: 60 }, target);
    expect(r.ok).toBe(false);
    expect(r.feedback).toBe('angle');
  });

  it('短すぎると length フィードバック', () => {
    const r = scoreWedge({ type: 'H', x: 10, y: 50, length: 20, angle: 0 }, target);
    expect(r.ok).toBe(false);
    expect(r.feedback).toBe('length');
  });

  it('W のお手本は位置とタイプで判定する', () => {
    const w: Wedge = { type: 'W', x: 40, y: 40, length: 0, angle: 45 };
    expect(scoreWedge({ ...w, x: 45 }, w).ok).toBe(true);
    expect(scoreWedge({ ...w, x: 80 }, w).ok).toBe(false);
  });
});

describe('totalScore', () => {
  it('各楔の平均を返す', () => {
    expect(
      totalScore([
        { ok: true, score: 100, feedback: null },
        { ok: true, score: 80, feedback: null },
      ]),
    ).toBe(90);
  });
});
