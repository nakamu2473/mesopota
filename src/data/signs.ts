import raw from './signs.json';
import { Sign } from '../lib/wedge';

export const SIGNS = raw as unknown as Sign[];

export const signIndex: Record<string, Sign> = Object.fromEntries(
  SIGNS.map((s) => [s.id, s]),
);

/** 楔分解データが整備済み（＝習字・読み取り対応）の文字 */
export const WRITABLE_SIGNS = SIGNS.filter((s) => s.wedges.length > 0);
