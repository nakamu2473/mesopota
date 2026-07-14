import { describe, expect, it } from 'vitest';
import { normalizeKana, splitMora } from '../kana';

describe('normalizeKana', () => {
  it('カタカナをひらがなに変換する', () => {
    expect(normalizeKana('メソポタミア')).toBe('めそぽたみあ');
  });
  it('空白を除去し長音符は残す', () => {
    expect(normalizeKana('ハンムラビ コード')).toBe('はんむらび こーど'.replace(/ /g, ''));
    expect(normalizeKana('コーヒー')).toBe('こーひー');
  });
});

describe('splitMora', () => {
  it('拗音を 1 モーラにまとめる', () => {
    expect(splitMora('ぎるがめしゅ')).toEqual(['ぎ', 'る', 'が', 'め', 'しゅ']);
  });
  it('ん・っ・ー も 1 モーラとして返す', () => {
    expect(splitMora('きゃんぷ')).toEqual(['きゃ', 'ん', 'ぷ']);
    expect(splitMora('らっぱー')).toEqual(['ら', 'っ', 'ぱ', 'ー']);
  });
});
