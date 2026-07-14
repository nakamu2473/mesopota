import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WedgeCanvas } from '../components/WedgeCanvas';
import { wedgePolygon } from '../components/WedgeGlyph';
import { Wedge } from '../lib/wedge';

const VIEW = 160;
const HEAD_W = 14;

/** SVG 文字列を組み立てて PNG としてダウンロードする */
function exportPng(wedges: Wedge[]) {
  const polys = wedges
    .map((w) => `<polygon points="${wedgePolygon(w, HEAD_W)}" fill="#3d2b1f"/>`)
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW} ${VIEW}" width="800" height="800"><rect width="${VIEW}" height="${VIEW}" fill="#f0e4cd"/>${polys}</svg>`;
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 800;
    canvas.getContext('2d')!.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'cuneiform.png';
    a.click();
  };
  img.src = url;
}

export function CanvasFree() {
  const [wedges, setWedges] = useState<Wedge[]>([]);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  function toRead() {
    sessionStorage.setItem('mesopota.read.wedges', JSON.stringify(wedges));
    navigate('/read');
  }

  async function copyJson() {
    await navigator.clipboard.writeText(JSON.stringify(wedges, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="page">
      <h1>自由書き</h1>
      <p className="note">ドラッグ＝楔を打つ／タップ＝小さい楔（ウィンケルハーケン）</p>
      <div className="canvas-wrap canvas-wrap-large">
        <WedgeCanvas wedges={wedges} onAdd={(w) => setWedges([...wedges, w])} viewSize={VIEW} headW={HEAD_W} />
      </div>
      <div className="btn-row">
        <button onClick={() => setWedges(wedges.slice(0, -1))} disabled={wedges.length === 0}>
          1本戻す
        </button>
        <button onClick={() => setWedges([])} disabled={wedges.length === 0}>
          全部消す
        </button>
        <button onClick={() => exportPng(wedges)} disabled={wedges.length === 0}>
          PNG保存
        </button>
        <button onClick={toRead} disabled={wedges.length === 0}>
          読み取りへ
        </button>
        <button onClick={copyJson} disabled={wedges.length === 0} title="楔データ（開発・文字データ作成用）">
          {copied ? 'コピーしました' : 'JSONコピー'}
        </button>
      </div>
    </div>
  );
}
