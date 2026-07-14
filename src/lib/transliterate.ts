/** 日本語（かな）→ 楔形文字の音写変換。翻訳ではなく音の近似であることに注意。 */

import kanaMapRaw from '../data/kana2sign.json';
import { signIndex } from '../data/signs';
import { codepointToChar } from './wedge';
import { normalizeKana, splitMora } from './kana';

const kanaMap = kanaMapRaw as Record<string, string[]>;

export type TransStatus = 'ok' | 'skipped' | 'unknown';

export interface TransItem {
  mora: string;
  signIds: string[];
  status: TransStatus;
  note?: string;
}

type Vowel = 'a' | 'i' | 'u' | 'e' | 'o' | null;

const VOWEL_SETS: Array<[Vowel, string]> = [
  ['a', 'あかさたなはまやらわがざだばぱぁゃ'],
  ['i', 'いきしちにひみりゐぎじぢびぴぃ'],
  ['u', 'うくすつぬふむゆるぐずづぶぷぅゅ'],
  ['e', 'えけせてねへめれゑげぜでべぺぇ'],
  ['o', 'おこそとのほもよろをごぞどぼぽぉょ'],
];

function moraVowel(mora: string): Vowel {
  const last = [...mora].pop()!;
  for (const [v, set] of VOWEL_SETS) {
    if (set.includes(last)) return v;
  }
  return null;
}

const N_BY_VOWEL: Record<string, string> = { a: 'AN', i: 'IN', u: 'UN', e: 'EN', o: 'UN' };
const LONG_BY_VOWEL: Record<string, string> = { a: 'A', i: 'I', u: 'U', e: 'E', o: 'U' };
const SMALL_TO_VOWEL_SIGN: Record<string, string> = {
  'ゃ': 'A', 'ゅ': 'U', 'ょ': 'U',
  'ぁ': 'A', 'ぃ': 'I', 'ぅ': 'U', 'ぇ': 'E', 'ぉ': 'U',
};

/** かな文字列を音写アイテム列に変換する */
export function transliterate(text: string): TransItem[] {
  const moras = splitMora(normalizeKana(text));
  const items: TransItem[] = [];
  let prevVowel: Vowel = null;

  for (const mora of moras) {
    if (mora === 'っ') {
      items.push({ mora, signIds: [], status: 'skipped', note: '促音は表記しません' });
      continue;
    }
    if (mora === 'ー') {
      if (prevVowel) {
        items.push({ mora, signIds: [LONG_BY_VOWEL[prevVowel]], status: 'ok' });
      } else {
        items.push({ mora, signIds: [], status: 'skipped', note: '長音の対象がありません' });
      }
      continue;
    }
    if (mora === 'ん') {
      const id = prevVowel ? N_BY_VOWEL[prevVowel] : 'EN';
      items.push({ mora, signIds: [id], status: 'ok' });
      continue;
    }

    const direct = kanaMap[mora];
    if (direct) {
      items.push({ mora, signIds: direct, status: 'ok' });
      prevVowel = moraVowel(mora);
      continue;
    }

    // 拗音・小書き母音（きゃ 等）: 子音側の文字 + 母音の文字で近似
    const chars = [...mora];
    if (chars.length === 2 && SMALL_TO_VOWEL_SIGN[chars[1]] && kanaMap[chars[0]]) {
      items.push({
        mora,
        signIds: [...kanaMap[chars[0]], SMALL_TO_VOWEL_SIGN[chars[1]]],
        status: 'ok',
        note: '2音に分解した近似',
      });
      prevVowel = moraVowel(mora);
      continue;
    }

    items.push({ mora, signIds: [], status: 'unknown', note: '変換できない文字です' });
    prevVowel = null;
  }
  return items;
}

/** 変換結果を楔形文字の Unicode 文字列にする */
export function itemsToString(items: TransItem[]): string {
  return items
    .flatMap((it) => it.signIds)
    .map((id) => codepointToChar(signIndex[id].codepoint))
    .join('');
}
