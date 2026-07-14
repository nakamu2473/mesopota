/** かな正規化とモーラ分割。 */

const SMALL_Y = new Set(['ゃ', 'ゅ', 'ょ']);
const SMALL_VOWEL = new Set(['ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ']);

/** カタカナ→ひらがな変換し、空白を除去する */
export function normalizeKana(text: string): string {
  let out = '';
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (cp >= 0x30a1 && cp <= 0x30f6) {
      out += String.fromCodePoint(cp - 0x60); // カタカナ → ひらがな
    } else if (ch === 'ー') {
      out += 'ー';
    } else if (/\s/.test(ch)) {
      // 空白は無視
    } else {
      out += ch;
    }
  }
  return out;
}

/**
 * ひらがな文字列をモーラに分割する。
 * 拗音（きゃ 等）は 1 モーラ。「ん」「っ」「ー」も 1 モーラとして返す。
 * かな以外の文字はそのまま 1 要素として返す（呼び出し側で未対応として扱う）。
 */
export function splitMora(kana: string): string[] {
  const chars = [...kana];
  const moras: string[] = [];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const next = chars[i + 1];
    if (next && (SMALL_Y.has(next) || SMALL_VOWEL.has(next))) {
      moras.push(ch + next);
      i++;
    } else {
      moras.push(ch);
    }
  }
  return moras;
}
