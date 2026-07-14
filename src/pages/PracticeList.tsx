import { Link } from 'react-router-dom';
import { WedgeGlyph } from '../components/WedgeGlyph';
import { WRITABLE_SIGNS } from '../data/signs';
import { loadProgress } from '../lib/progress';

export function PracticeList() {
  const progress = loadProgress();
  const byLevel = [1, 2, 3].map(
    (lv) => [lv, WRITABLE_SIGNS.filter((s) => s.level === lv)] as const,
  );

  return (
    <div className="page">
      <h1>習字 — 文字をえらぶ</h1>
      <p className="note">
        楔形文字は「楔（くさび）」を粘土に押した文字です。ドラッグで楔を 1 本ずつ打って、お手本をなぞりましょう。
        字形は学習用に簡略化したものです。
      </p>
      {byLevel.map(([lv, signs]) =>
        signs.length === 0 ? null : (
          <section key={lv}>
            <h2>レベル {lv}</h2>
            <div className="sign-grid">
              {signs.map((s) => {
                const p = progress[s.id];
                return (
                  <Link key={s.id} to={`/practice/${s.id}`} className="sign-card">
                    <WedgeGlyph wedges={s.wedges} size={72} />
                    <div className="sign-card-name">{s.name}</div>
                    <div className="sign-card-value">{s.values[0]}</div>
                    {p?.mastered ? (
                      <div className="badge badge-master">習得</div>
                    ) : p ? (
                      <div className="badge">ベスト {p.bestScore}</div>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </section>
        ),
      )}
    </div>
  );
}
