import { useState } from 'react';
import { Link } from 'react-router-dom';
import { WedgeCanvas } from '../components/WedgeCanvas';
import { SIGNS } from '../data/signs';
import { Candidate, recognize } from '../lib/recognizer';
import { codepointToChar, Wedge } from '../lib/wedge';

function loadHandoff(): Wedge[] {
  try {
    const raw = sessionStorage.getItem('mesopota.read.wedges');
    sessionStorage.removeItem('mesopota.read.wedges');
    return raw ? (JSON.parse(raw) as Wedge[]) : [];
  } catch {
    return [];
  }
}

export function Read() {
  const [wedges, setWedges] = useState<Wedge[]>(loadHandoff);
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);

  function run() {
    setCandidates(recognize(wedges, SIGNS));
  }

  return (
    <div className="page">
      <h1>読み取り</h1>
      <p className="note">楔形文字を 1 文字書いて「読み取る」を押してください（習字対応の文字が対象）。</p>
      <div className="canvas-wrap">
        <WedgeCanvas
          wedges={wedges}
          onAdd={(w) => {
            setWedges([...wedges, w]);
            setCandidates(null);
          }}
        />
      </div>
      <div className="btn-row">
        <button onClick={() => { setWedges(wedges.slice(0, -1)); setCandidates(null); }} disabled={wedges.length === 0}>
          1本戻す
        </button>
        <button onClick={() => { setWedges([]); setCandidates(null); }} disabled={wedges.length === 0}>
          全部消す
        </button>
        <button className="primary" onClick={run} disabled={wedges.length === 0}>
          読み取る
        </button>
      </div>

      {candidates && (
        <div className="candidates">
          {candidates.length === 0 && <p>候補が見つかりませんでした。</p>}
          {candidates.map((c) => (
            <Link to={`/signs/${c.sign.id}`} key={c.sign.id} className="candidate">
              <span className="cuneiform candidate-glyph">{codepointToChar(c.sign.codepoint)}</span>
              <span className="candidate-body">
                <b>{c.sign.name}</b> /{c.sign.values.join(', ')}/
                {c.sign.meaning && <span className="sign-meaning">「{c.sign.meaning}」</span>}
              </span>
              <span className="confidence">
                <span className="confidence-bar" style={{ width: `${Math.round(c.confidence * 100)}%` }} />
                <span className="confidence-num">{Math.round(c.confidence * 100)}%</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
