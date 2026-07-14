import { Link } from 'react-router-dom';
import { SIGNS, WRITABLE_SIGNS } from '../data/signs';
import { loadProgress } from '../lib/progress';
import { codepointToChar } from '../lib/wedge';

const FEATURES = [
  { to: '/practice', title: '習字', desc: 'お手本をなぞって楔形文字を練習', icon: '𒀭' },
  { to: '/canvas', title: '自由書き', desc: 'キャンバスに自由に書いて保存', icon: '𒆳' },
  { to: '/read', title: '読み取り', desc: '書いた文字が何かを判定', icon: '𒅆' },
  { to: '/convert', title: '日本語変換', desc: 'かなを楔形文字に音写', icon: '𒉺' },
];

export function Home() {
  const progress = loadProgress();
  const practiced = Object.keys(progress).length;
  const mastered = Object.values(progress).filter((p) => p.mastered).length;

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-glyphs">
          {['LUGAL', 'AN', 'KUR', 'SHE', 'KA'].map((id) => {
            const s = SIGNS.find((x) => x.id === id)!;
            return (
              <Link key={id} to={`/signs/${id}`} className="cuneiform hero-glyph" title={s.name}>
                {codepointToChar(s.codepoint)}
              </Link>
            );
          })}
        </div>
        <h1>mesopota</h1>
        <p>楔形文字を書いて、読んで、遊んで学ぶ</p>
      </div>

      <div className="feature-grid">
        {FEATURES.map((f) => (
          <Link key={f.to} to={f.to} className="feature-card">
            <span className="cuneiform feature-icon">{f.icon}</span>
            <h2>{f.title}</h2>
            <p>{f.desc}</p>
          </Link>
        ))}
      </div>

      <div className="stats">
        収録 {SIGNS.length} 文字（うち習字対応 {WRITABLE_SIGNS.length} 文字）・練習済み {practiced} 文字・習得 {mastered} 文字
      </div>
    </div>
  );
}
