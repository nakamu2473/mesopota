import { ReactNode, useRef, useState } from 'react';
import { Wedge, dragToWedge } from '../lib/wedge';
import { wedgePolygon } from './WedgeGlyph';

interface WedgeCanvasProps {
  /** 確定済みの楔（表示のみ。追加は onAdd 経由） */
  wedges: Wedge[];
  onAdd: (w: Wedge) => void;
  /** viewBox の一辺（楔データの座標系） */
  viewSize?: number;
  headW?: number;
  /** ガイドなど、ユーザーの楔の下に描くもの */
  children?: ReactNode;
  disabled?: boolean;
  inkColor?: string;
}

interface Drag {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** 楔スタンプ入力キャンバス。ドラッグ＝楔 1 本、タップ＝ウィンケルハーケン。 */
export function WedgeCanvas({
  wedges,
  onAdd,
  viewSize = 100,
  headW = 15,
  children,
  disabled = false,
  inkColor = '#3d2b1f',
}: WedgeCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null);

  function toLocal(e: React.PointerEvent): { x: number; y: number } {
    const rect = svgRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * viewSize,
      y: ((e.clientY - rect.top) / rect.height) * viewSize,
    };
  }

  function onDown(e: React.PointerEvent) {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = toLocal(e);
    setDrag({ x1: p.x, y1: p.y, x2: p.x, y2: p.y });
  }

  function onMove(e: React.PointerEvent) {
    if (!drag) return;
    const p = toLocal(e);
    setDrag({ ...drag, x2: p.x, y2: p.y });
  }

  function onUp() {
    if (!drag) return;
    onAdd(dragToWedge(drag.x1, drag.y1, drag.x2, drag.y2));
    setDrag(null);
  }

  const preview =
    drag && Math.hypot(drag.x2 - drag.x1, drag.y2 - drag.y1) >= 2
      ? dragToWedge(drag.x1, drag.y1, drag.x2, drag.y2)
      : null;

  return (
    <svg
      ref={svgRef}
      className="wedge-canvas"
      viewBox={`0 0 ${viewSize} ${viewSize}`}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={() => setDrag(null)}
    >
      <rect x={0} y={0} width={viewSize} height={viewSize} fill="transparent" />
      {children}
      {wedges.map((w, i) => (
        <polygon key={i} points={wedgePolygon(w, headW)} fill={inkColor} opacity={0.9} />
      ))}
      {preview && (
        <polygon points={wedgePolygon(preview, headW)} fill={inkColor} opacity={0.45} />
      )}
    </svg>
  );
}
