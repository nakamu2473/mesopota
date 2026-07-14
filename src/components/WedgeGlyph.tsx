import { Wedge, DEG } from '../lib/wedge';

/** 楔 1 本を SVG ポリゴンの points 文字列に変換する */
export function wedgePolygon(w: Wedge, headW = 15): string {
  const len = Math.max(w.length, w.type === 'W' ? headW * 1.1 : headW);
  const dx = Math.cos(w.angle * DEG);
  const dy = Math.sin(w.angle * DEG);
  const nx = -dy;
  const ny = dx;
  const hw = headW / 2;
  const pts = [
    [w.x + nx * hw, w.y + ny * hw],
    [w.x + dx * len, w.y + dy * len],
    [w.x - nx * hw, w.y - ny * hw],
    [w.x - dx * hw * 0.6, w.y - dy * hw * 0.6],
  ];
  return pts.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ');
}

interface WedgeGlyphProps {
  wedges: Wedge[];
  /** CSS px。省略時は親に合わせる */
  size?: number;
  /** 楔ごとの塗り色。省略時は既定のインク色 */
  colorFor?: (index: number) => string;
  headW?: number;
  viewSize?: number;
  className?: string;
}

/** 楔の集合を 1 つの SVG として描画する（全機能で共用） */
export function WedgeGlyph({
  wedges,
  size,
  colorFor,
  headW = 15,
  viewSize = 100,
  className,
}: WedgeGlyphProps) {
  const pad = viewSize * 0.08;
  return (
    <svg
      viewBox={`${-pad} ${-pad} ${viewSize + pad * 2} ${viewSize + pad * 2}`}
      width={size}
      height={size}
      className={className}
    >
      {wedges.map((w, i) => (
        <polygon key={i} points={wedgePolygon(w, headW)} fill={colorFor ? colorFor(i) : '#3d2b1f'} />
      ))}
    </svg>
  );
}
