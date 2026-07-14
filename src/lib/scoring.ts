/** 習字モードのなぞり判定。DOM 非依存の純関数。 */

import { Wedge, angleDiff, dist } from './wedge';

export type Feedback = 'position' | 'angle' | 'length' | null;

export interface WedgeScore {
  ok: boolean;
  /** 0–100 */
  score: number;
  /** 不合格のとき最も大きかった誤差の種類 */
  feedback: Feedback;
}

/** 頭位置の許容誤差（100 座標系） */
export const POS_TOLERANCE = 16;
/** 角度の許容誤差（度） */
export const ANGLE_TOLERANCE = 30;
/** 長さ比の許容範囲 */
export const LENGTH_RATIO_MIN = 0.45;
export const LENGTH_RATIO_MAX = 2.0;

/**
 * ユーザーが打った楔 1 本をお手本と比較して採点する。
 * W（ウィンケルハーケン）は位置とタイプのみで判定する。
 */
export function scoreWedge(input: Wedge, target: Wedge): WedgeScore {
  const posErr = dist(input.x, input.y, target.x, target.y);
  const posScore = Math.max(0, 1 - posErr / (POS_TOLERANCE * 2));

  if (target.type === 'W') {
    const ok = posErr <= POS_TOLERANCE && input.type === 'W';
    return {
      ok,
      score: Math.round(posScore * 100),
      feedback: ok ? null : posErr > POS_TOLERANCE ? 'position' : 'length',
    };
  }

  // W 以外の楔に対してタップ（W）した場合は長さ不足として扱う
  if (input.type === 'W') {
    return { ok: false, score: Math.round(posScore * 30), feedback: 'length' };
  }

  const angErr = angleDiff(input.angle, target.angle);
  const angScore = Math.max(0, 1 - angErr / (ANGLE_TOLERANCE * 2));
  const ratio = target.length > 0 ? input.length / target.length : 1;
  const lenOk = ratio >= LENGTH_RATIO_MIN && ratio <= LENGTH_RATIO_MAX;
  const lenScore = Math.max(0, 1 - Math.abs(Math.log(Math.max(ratio, 0.01))) / Math.log(3));

  const score = Math.round((posScore * 0.45 + angScore * 0.35 + lenScore * 0.2) * 100);
  const posOk = posErr <= POS_TOLERANCE;
  const angOk = angErr <= ANGLE_TOLERANCE;
  const ok = posOk && angOk && lenOk;

  let feedback: Feedback = null;
  if (!ok) {
    if (!posOk) feedback = 'position';
    else if (!angOk) feedback = 'angle';
    else feedback = 'length';
  }
  return { ok, score, feedback };
}

/** 1 文字分の総合スコア（各楔の平均） */
export function totalScore(scores: WedgeScore[]): number {
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length);
}
