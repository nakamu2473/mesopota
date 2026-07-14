/** 学習進捗の localStorage 永続化。 */

export interface SignProgress {
  bestScore: number;
  attempts: number;
  /** スコア 80 以上を取った回数 */
  goodCount: number;
  lastPracticed: string; // ISO 8601
  mastered: boolean;
}

export type Progress = Record<string, SignProgress>;

const KEY = 'mesopota.progress.v1';
const MASTER_SCORE = 80;
const MASTER_COUNT = 3;

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Progress) : {};
  } catch {
    return {};
  }
}

export function saveProgress(p: Progress): void {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function recordAttempt(signId: string, score: number): SignProgress {
  const all = loadProgress();
  const prev = all[signId] ?? {
    bestScore: 0,
    attempts: 0,
    goodCount: 0,
    lastPracticed: '',
    mastered: false,
  };
  const next: SignProgress = {
    bestScore: Math.max(prev.bestScore, score),
    attempts: prev.attempts + 1,
    goodCount: prev.goodCount + (score >= MASTER_SCORE ? 1 : 0),
    lastPracticed: new Date().toISOString(),
    mastered: prev.mastered || prev.goodCount + (score >= MASTER_SCORE ? 1 : 0) >= MASTER_COUNT,
  };
  all[signId] = next;
  saveProgress(all);
  return next;
}
