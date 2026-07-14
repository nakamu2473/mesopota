/** 楔（ウェッジ）モデル。全機能の土台となる幾何データと計算。 */

export type WedgeType = 'H' | 'V' | 'D' | 'W';

/** 1本の楔。文字ローカル座標系（0–100、y は下向き）で定義する。 */
export interface Wedge {
  type: WedgeType;
  /** 頭（打点）の位置 */
  x: number;
  y: number;
  /** 尾の長さ（W は 0） */
  length: number;
  /** 尾の方向（度）。右=0、下=90 */
  angle: number;
}

export interface Sign {
  id: string;
  codepoint: string; // "U+12157" 形式
  name: string;
  values: string[];
  meaning?: string;
  /** 楔分解データ。未整備の文字は空配列（フォント表示のみ） */
  wedges: Wedge[];
  level: 1 | 2 | 3;
}

export const DEG = Math.PI / 180;

/** codepoint 文字列 ("U+12157") → 実際の文字 */
export function codepointToChar(cp: string): string {
  return String.fromCodePoint(parseInt(cp.replace(/^U\+/i, ''), 16));
}

/** 角度差を -180..180 に正規化した絶対値 */
export function angleDiff(a: number, b: number): number {
  let d = (a - b) % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return Math.abs(d);
}

export function dist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1);
}

/** 楔の尾の先端座標 */
export function wedgeTip(w: Wedge): { x: number; y: number } {
  return {
    x: w.x + Math.cos(w.angle * DEG) * w.length,
    y: w.y + Math.sin(w.angle * DEG) * w.length,
  };
}

/** H/V へのスナップ許容角度 */
export const SNAP_ANGLE = 20;
/** これより短いドラッグはウィンケルハーケン（タップ）扱い */
export const TAP_LENGTH = 8;

/**
 * ドラッグ操作（始点→終点）を楔に変換する。
 * 始点＝頭、方向と距離＝尾。短いドラッグは W、H/V 近傍はスナップ。
 */
export function dragToWedge(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  snap = true,
): Wedge {
  const length = dist(x1, y1, x2, y2);
  if (length < TAP_LENGTH) {
    return { type: 'W', x: x1, y: y1, length: 0, angle: 45 };
  }
  let angle = (Math.atan2(y2 - y1, x2 - x1) / DEG + 360) % 360;
  let type: WedgeType = 'D';
  if (snap) {
    if (angleDiff(angle, 0) <= SNAP_ANGLE) {
      angle = 0;
      type = 'H';
    } else if (angleDiff(angle, 90) <= SNAP_ANGLE) {
      angle = 90;
      type = 'V';
    }
  } else {
    if (angle === 0) type = 'H';
    else if (angle === 90) type = 'V';
  }
  return { type, x: x1, y: y1, length, angle };
}

export interface BBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** 楔集合のバウンディングボックス（頭と尾の両端を含む） */
export function wedgesBBox(wedges: Wedge[]): BBox {
  const box: BBox = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  for (const w of wedges) {
    const tip = wedgeTip(w);
    box.minX = Math.min(box.minX, w.x, tip.x);
    box.minY = Math.min(box.minY, w.y, tip.y);
    box.maxX = Math.max(box.maxX, w.x, tip.x);
    box.maxY = Math.max(box.maxY, w.y, tip.y);
  }
  return box;
}

/**
 * 楔集合を 0–100 座標系へ正規化する（縦横比は維持し、長辺を 100 に合わせて中央寄せ）。
 * 認識時に入力とお手本を同じ土俵に載せるための前処理。
 */
export function normalizeWedges(wedges: Wedge[]): Wedge[] {
  if (wedges.length === 0) return [];
  const box = wedgesBBox(wedges);
  const w = box.maxX - box.minX;
  const h = box.maxY - box.minY;
  const size = Math.max(w, h, 1);
  const scale = 100 / size;
  const offX = (100 - w * scale) / 2;
  const offY = (100 - h * scale) / 2;
  return wedges.map((wd) => ({
    ...wd,
    x: (wd.x - box.minX) * scale + offX,
    y: (wd.y - box.minY) * scale + offY,
    length: wd.length * scale,
  }));
}
