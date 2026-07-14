import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { WedgeGlyph } from '../components/WedgeGlyph';
import { signIndex } from '../data/signs';
import { codepointToChar } from '../lib/wedge';

export function SignDetail() {
  const { id } = useParams();
  const sign = id ? signIndex[id] : undefined;
  const [revealed, setRevealed] = useState(-1); // -1 = 全表示
  const timer = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => () => clearInterval(timer.current), []);

  if (!sign) {
    return (
      <div className="page">
        <p>文字が見つかりません。</p>
        <Link to="/">ホームへ</Link>
      </div>
    );
  }

  function playStrokes() {
    clearInterval(timer.current);
    setRevealed(0);
    let i = 0;
    timer.current = setInterval(() => {
      i++;
      setRevealed(i);
      if (i >= sign!.wedges.length) clearInterval(timer.current);
    }, 600);
  }

  return (
    <div className="page">
      <h1>
        {sign.name} <span className="sign-value">/{sign.values.join(', ')}/</span>
      </h1>
      {sign.meaning && <p>意味: {sign.meaning}</p>}
      <p>Unicode: {sign.codepoint}</p>

      <div className="detail-glyphs">
        <div className="detail-glyph">
          <span className="cuneiform detail-font">{codepointToChar(sign.codepoint)}</span>
          <span className="caption">フォント字形</span>
        </div>
        {sign.wedges.length > 0 && (
          <div className="detail-glyph">
            <WedgeGlyph
              wedges={sign.wedges}
              size={160}
              colorFor={(i) => (revealed < 0 || i < revealed ? '#3d2b1f' : '#e8dcc8')}
            />
            <span className="caption">簡略字形（{sign.wedges.length} 楔）</span>
          </div>
        )}
      </div>

      <div className="btn-row">
        {sign.wedges.length > 0 && (
          <>
            <button onClick={playStrokes}>書き順を再生</button>
            <Link className="btn primary" to={`/practice/${sign.id}`}>この文字を練習する</Link>
          </>
        )}
      </div>
    </div>
  );
}
