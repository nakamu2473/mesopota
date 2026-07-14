import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { signIndex } from '../data/signs';
import { itemsToString, transliterate } from '../lib/transliterate';
import { codepointToChar } from '../lib/wedge';

export function Convert() {
  const [text, setText] = useState('めそぽたみあ');
  const [copied, setCopied] = useState(false);
  const items = useMemo(() => transliterate(text), [text]);
  const result = itemsToString(items);

  async function copy() {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="page">
      <h1>日本語 → 楔形文字</h1>
      <p className="note">
        ひらがな・カタカナを、アッカド語の音節文字で<b>音写</b>します（意味の翻訳ではありません）。
        「お段」は u、「し」は ši など、楔形文字にない音は近い音で代用します。
      </p>
      <input
        className="convert-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="ひらがなで入力（例: ぎるがめしゅ）"
      />

      {result && (
        <div className="convert-output">
          <div className="cuneiform convert-result">{result}</div>
          <button onClick={copy}>{copied ? 'コピーしました' : 'テキストをコピー'}</button>
        </div>
      )}

      {items.length > 0 && (
        <div className="mora-list">
          {items.map((it, i) => (
            <div key={i} className={`mora-item mora-${it.status}`}>
              <div className="mora-kana">{it.mora}</div>
              {it.status === 'ok' ? (
                <>
                  <div className="cuneiform mora-glyph">
                    {it.signIds.map((id) => codepointToChar(signIndex[id].codepoint)).join('')}
                  </div>
                  <div className="mora-reading">
                    {it.signIds.map((id, j) => (
                      <Link key={j} to={`/signs/${id}`}>{signIndex[id].values[0]}</Link>
                    ))}
                  </div>
                </>
              ) : (
                <div className="mora-note">{it.note}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
