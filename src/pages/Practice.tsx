import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { WedgeCanvas } from '../components/WedgeCanvas';
import { wedgePolygon } from '../components/WedgeGlyph';
import { signIndex } from '../data/signs';
import { recordAttempt } from '../lib/progress';
import { scoreWedge, totalScore, WedgeScore, Feedback } from '../lib/scoring';
import { Wedge, DEG, wedgeTip } from '../lib/wedge';

const FEEDBACK_TEXT: Record<Exclude<Feedback, null>, string> = {
  position: '位置がずれています。◎印から打ちましょう',
  angle: '向きが違います。矢印の方向へ',
  length: '長さが違います。矢印の先までドラッグ',
};

/** 次に打つ楔のガイド（打点マーカー + 方向矢印） */
function TargetMarker({ w }: { w: Wedge }) {
  const tip = wedgeTip(w);
  if (w.type === 'W') {
    return <circle cx={w.x} cy={w.y} r={6} className="target-marker" />;
  }
  const ax = Math.cos(w.angle * DEG);
  const ay = Math.sin(w.angle * DEG);
  return (
    <g>
      <circle cx={w.x} cy={w.y} r={5} className="target-marker" />
      <line
        x1={w.x}
        y1={w.y}
        x2={tip.x}
        y2={tip.y}
        className="target-arrow"
        strokeDasharray="4 3"
      />
      <polygon
        points={`${tip.x},${tip.y} ${tip.x - ax * 8 - ay * 4},${tip.y - ay * 8 + ax * 4} ${tip.x - ax * 8 + ay * 4},${tip.y - ay * 8 - ax * 4}`}
        className="target-arrowhead"
      />
    </g>
  );
}

export function Practice() {
  const { id } = useParams();
  const sign = id ? signIndex[id] : undefined;

  const [idx, setIdx] = useState(0);
  const [scores, setScores] = useState<WedgeScore[]>([]);
  const [drawn, setDrawn] = useState<Wedge[]>([]);
  const [message, setMessage] = useState('◎印からドラッグして楔を打ちましょう（タップ＝小さい楔）');
  const [fails, setFails] = useState(0);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  if (!sign || sign.wedges.length === 0) {
    return (
      <div className="page">
        <p>この文字の習字データはまだありません。</p>
        <Link to="/practice">一覧へ戻る</Link>
      </div>
    );
  }

  const done = idx >= sign.wedges.length;
  const target = done ? null : sign.wedges[idx];

  function reset() {
    setIdx(0);
    setScores([]);
    setDrawn([]);
    setFails(0);
    setFinalScore(null);
    setMessage('◎印からドラッグして楔を打ちましょう（タップ＝小さい楔）');
  }

  function onAdd(w: Wedge) {
    if (!target || finalScore !== null) return;
    const result = scoreWedge(w, target);
    if (result.ok) {
      const newScores = [...scores, result];
      const newDrawn = [...drawn, w];
      setScores(newScores);
      setDrawn(newDrawn);
      setFails(0);
      if (idx + 1 >= sign!.wedges.length) {
        const total = totalScore(newScores);
        setFinalScore(total);
        recordAttempt(sign!.id, total);
        setIdx(idx + 1);
      } else {
        setIdx(idx + 1);
        setMessage(`いいですね！ 次の楔へ（${idx + 2} / ${sign!.wedges.length}）`);
      }
    } else {
      setFails(fails + 1);
      setMessage(result.feedback ? FEEDBACK_TEXT[result.feedback] : 'もう一度');
    }
  }

  return (
    <div className="page">
      <div className="practice-head">
        <Link to="/practice">← 一覧</Link>
        <h1>
          {sign.name} <span className="sign-value">/{sign.values[0]}/</span>
          {sign.meaning && <span className="sign-meaning">「{sign.meaning}」</span>}
        </h1>
      </div>

      <div className="canvas-wrap">
        <WedgeCanvas wedges={drawn} onAdd={onAdd} disabled={finalScore !== null}>
          {/* お手本: 完了分は濃く、残りは薄く */}
          {sign.wedges.map((w, i) => (
            <polygon
              key={i}
              points={wedgePolygon(w)}
              fill={i < idx ? '#c8b294' : '#e8dcc8'}
            />
          ))}
          {/* 3回失敗したら正解の楔を強調表示 */}
          {target && fails >= 3 && (
            <polygon points={wedgePolygon(target)} className="hint-wedge" />
          )}
          {target && <TargetMarker w={target} />}
        </WedgeCanvas>
      </div>

      {finalScore === null ? (
        <p className="practice-message">{message}</p>
      ) : (
        <div className="practice-result">
          <div className="score">スコア {finalScore}</div>
          <p>{finalScore >= 80 ? 'すばらしい！粘土板の書記官のようです' : finalScore >= 50 ? 'その調子！' : '繰り返し練習しましょう'}</p>
          <div className="btn-row">
            <button onClick={reset}>もう一度</button>
            <Link className="btn" to="/practice">一覧へ</Link>
          </div>
        </div>
      )}

      <div className="progress-dots">
        {sign.wedges.map((_, i) => (
          <span key={i} className={`dot ${i < idx ? 'dot-done' : i === idx ? 'dot-now' : ''}`} />
        ))}
      </div>
    </div>
  );
}
