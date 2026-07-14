/** 読み取りモード：楔集合同士のマッチングによるルールベース認識。 */

import { Sign, Wedge, angleDiff, dist, normalizeWedges } from './wedge';

export interface Candidate {
  sign: Sign;
  /** 0–1 */
  confidence: number;
}

const TYPE_MISMATCH_PENALTY = 40;
const ANGLE_WEIGHT = 0.5;
const UNMATCHED_PENALTY = 70;

/** 楔 1 本同士の対応コスト（小さいほど近い） */
function wedgeCost(a: Wedge, b: Wedge): number {
  let cost = dist(a.x, a.y, b.x, b.y);
  cost += angleDiff(a.angle, b.angle) * ANGLE_WEIGHT * (a.type === 'W' || b.type === 'W' ? 0 : 1);
  if (a.type !== b.type) {
    // H と D、V と D の混同は軽い減点、W とそれ以外は重い減点
    const soft = (a.type !== 'W' && b.type !== 'W');
    cost += soft ? TYPE_MISMATCH_PENALTY / 2 : TYPE_MISMATCH_PENALTY;
  }
  return cost;
}

/**
 * 入力楔とお手本楔を貪欲法で対応付けし、平均コストを返す。
 * 対応相手が余った分にはペナルティを課す。
 */
function matchCost(input: Wedge[], target: Wedge[]): number {
  const used = new Set<number>();
  let total = 0;
  for (const iw of input) {
    let best = -1;
    let bestCost = Infinity;
    for (let j = 0; j < target.length; j++) {
      if (used.has(j)) continue;
      const c = wedgeCost(iw, target[j]);
      if (c < bestCost) {
        bestCost = c;
        best = j;
      }
    }
    if (best >= 0) {
      used.add(best);
      total += bestCost;
    } else {
      total += UNMATCHED_PENALTY;
    }
  }
  total += (target.length - used.size) * UNMATCHED_PENALTY;
  return total / Math.max(input.length, target.length);
}

/**
 * 書かれた楔の集合から文字候補を返す（スコア降順・上位 topN 件）。
 * 楔データ未整備（wedges が空）の文字は対象外。
 */
export function recognize(input: Wedge[], signs: Sign[], topN = 5): Candidate[] {
  if (input.length === 0) return [];
  const normInput = normalizeWedges(input);
  const results: Candidate[] = [];
  for (const sign of signs) {
    if (sign.wedges.length === 0) continue;
    // 楔本数が大きく違う文字は足切り
    if (Math.abs(sign.wedges.length - input.length) > Math.max(2, input.length)) continue;
    const cost = matchCost(normInput, normalizeWedges(sign.wedges));
    const confidence = 1 / (1 + cost / 25);
    results.push({ sign, confidence });
  }
  results.sort((a, b) => b.confidence - a.confidence);
  return results.slice(0, topN);
}
