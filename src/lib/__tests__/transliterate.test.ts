import { describe, expect, it } from 'vitest';
import { itemsToString, transliterate } from '../transliterate';

function ids(text: string): string[] {
  return transliterate(text).flatMap((it) => it.signIds);
}

describe('transliterate', () => {
  it('基本モーラを変換する', () => {
    expect(ids('かみ')).toEqual(['KA', 'MI']);
  });

  it('ん は直前の母音で AN/IN/UN/EN になる', () => {
    expect(ids('かん')).toEqual(['KA', 'AN']);
    expect(ids('きん')).toEqual(['KI', 'IN']);
    expect(ids('こん')).toEqual(['KU', 'UN']);
    expect(ids('けん')).toEqual(['KI', 'EN']);
  });

  it('促音はスキップされる', () => {
    const items = transliterate('らっぱ');
    expect(items[1].status).toBe('skipped');
    expect(ids('らっぱ')).toEqual(['RA', 'PA']);
  });

  it('長音は直前の母音の文字になる', () => {
    expect(ids('こーひー')).toEqual(['KU', 'U', 'HI', 'I']);
  });

  it('拗音は 2 音に分解される', () => {
    expect(ids('しゃ')).toEqual(['IGI', 'A']);
  });

  it('カタカナも変換できる', () => {
    expect(ids('メソポタミア')).toEqual(['ME', 'SU', 'BU', 'TA', 'MI', 'A']);
  });

  it('変換できない文字は unknown になる', () => {
    const items = transliterate('漢');
    expect(items[0].status).toBe('unknown');
  });

  it('結果を Unicode 文字列にできる', () => {
    const items = transliterate('あん');
    expect(itemsToString(items)).toBe('\u{12000}\u{1202D}');
  });
});
