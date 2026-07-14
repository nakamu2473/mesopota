import { describe, expect, it } from 'vitest';
import { SIGNS, WRITABLE_SIGNS } from '../../data/signs';
import { recognize } from '../recognizer';
import { Wedge } from '../wedge';

describe('recognize', () => {
  it('お手本どおりの入力は本人が 1 位になる', () => {
    for (const sign of WRITABLE_SIGNS) {
      const result = recognize(sign.wedges, SIGNS);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].sign.id, `sign=${sign.id}`).toBe(sign.id);
    }
  });

  it('位置やサイズが違っても正規化されて認識される', () => {
    const an = WRITABLE_SIGNS.find((s) => s.id === 'AN')!;
    const shifted: Wedge[] = an.wedges.map((w) => ({
      ...w,
      x: w.x * 0.5 + 20,
      y: w.y * 0.5 + 30,
      length: w.length * 0.5,
    }));
    const result = recognize(shifted, SIGNS);
    expect(result[0].sign.id).toBe('AN');
  });

  it('空の入力は空の候補を返す', () => {
    expect(recognize([], SIGNS)).toEqual([]);
  });
});
