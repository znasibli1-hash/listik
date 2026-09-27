import { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '@/context/I18nContext';
import { DemoBadge } from '@/components/ui/DemoBadge';

/**
 * Hero illustration: a line-drawn Chlorophytum comosum in a "sensor chamber",
 * surrounded by CO₂ data points. The pointer acts like a probe: points near it light up.
 * The sparkline is an animated DEMO signal, not sensor data.
 */
const W = 440, H = 420;
const BASE = { x: 220, y: 300 };

interface Leaf { d: string; stripe: string }
function makeLeaf(angleDeg: number, length: number, bend: number, width: number): Leaf {
  const a = (angleDeg * Math.PI) / 180;
  const tip = { x: BASE.x + Math.cos(a) * length, y: BASE.y - Math.sin(a) * length * 0.9 + bend };
  const mid = { x: BASE.x + Math.cos(a) * length * 0.55, y: BASE.y - Math.sin(a) * length * 0.75 - Math.abs(Math.cos(a)) * 30 };
  const nx = -Math.sin(a) * width, ny = -Math.cos(a) * width;
  const d = `M${BASE.x},${BASE.y} Q${mid.x + nx},${mid.y + ny} ${tip.x},${tip.y} Q${mid.x - nx},${mid.y - ny} ${BASE.x},${BASE.y}Z`;
  const stripe = `M${BASE.x},${BASE.y} Q${mid.x},${mid.y} ${tip.x},${tip.y}`;
  return { d, stripe };
}

const LEAVES: Leaf[] = [
  [168, 150, 60, 7], [150, 170, 10, 8], [132, 175, -10, 8], [115, 165, -6, 7], [100, 185, 0, 8],
  [84, 170, -8, 7], [66, 172, -12, 8], [48, 165, 8, 8], [30, 150, 55, 7], [95, 120, -4, 6], [80, 125, 0, 6], [110, 118, 0, 6],
].map(([a, l, b, w]) => makeLeaf(a, l, b, w));

function seeded(n: number) { const x = Math.sin(n * 999.1) * 10000; return x - Math.floor(x); }
const POINTS = Array.from({ length: 34 }, (_, i) => {
  const angle = seeded(i + 1) * Math.PI * 2;
  const r = 90 + seeded(i + 40) * 120;
  return { id: i, x: 220 + Math.cos(angle) * r, y: 160 + Math.sin(angle) * r * 0.75, r: 2.2 + seeded(i + 80) * 2.8, delay: seeded(i + 7) * 6 };
}).filter((p) => p.y < 318 && p.y > 24 && p.x > 18 && p.x < W - 18);

export function PlantDataViz() {
  const { t } = useI18n();
  const svgRef = useRef<SVGSVGElement>(null);
  const [probe, setProbe] = useState<{ x: number; y: number } | null>(null);
  const [series, setSeries] = useState<number[]>(() => Array.from({ length: 28 }, (_, i) => 0.5 + Math.sin(i / 3) * 0.18));

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let k = 28;
    const id = setInterval(() => {
      k++;
      setSeries((s) => [...s.slice(1), Math.max(0.1, Math.min(0.9, 0.5 + Math.sin(k / 3) * 0.18 + (Math.random() - 0.5) * 0.12))]);
    }, 900);
    return () => clearInterval(id);
  }, []);

  const spark = useMemo(() => series.map((v, i) => `${(i / (series.length - 1)) * 100},${30 - v * 26}`).join(' '), [series]);

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current!.getBoundingClientRect();
    setProbe({ x: ((e.clientX - rect.left) / rect.width) * W, y: ((e.clientY - rect.top) / rect.height) * H });
  };

  const near = (p: { x: number; y: number }) => probe && Math.hypot(p.x - probe.x, p.y - probe.y) < 70;
  const nearCount = POINTS.filter(near).length;

  return (
    <figure className="relative">
      <div className="lab-grid relative overflow-hidden rounded-[28px] border border-line bg-surface">
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full touch-none select-none" role="img" aria-label={t.home.vizCaption}
          onPointerMove={onMove} onPointerLeave={() => setProbe(null)} onPointerDown={onMove}>
          {/* chamber corner ticks */}
          {[[16, 16, 1, 1], [W - 16, 16, -1, 1], [16, H - 16, 1, -1], [W - 16, H - 16, -1, -1]].map(([x, y, sx, sy], i) => (
            <path key={i} d={`M${x},${y + sy * 14} V${y} H${x + sx * 14}`} fill="none" stroke="rgb(var(--muted))" strokeOpacity=".5" strokeWidth="1.2" />
          ))}

          {/* CO₂ data points */}
          {POINTS.map((p) => {
            const lit = near(p);
            return (
              <g key={p.id} className="animate-drift" style={{ animationDelay: `-${p.delay}s`, transformOrigin: `${p.x}px ${p.y}px` }}>
                <circle cx={p.x} cy={p.y} r={lit ? p.r + 2 : p.r} fill={lit ? 'rgb(var(--signal))' : 'rgb(var(--muted))'} fillOpacity={lit ? 0.95 : 0.35}
                  style={{ transition: 'r .2s, fill .2s, fill-opacity .2s' }} />
                {lit && <circle cx={p.x} cy={p.y} r={p.r + 7} fill="none" stroke="rgb(var(--signal))" strokeOpacity=".35" />}
              </g>
            );
          })}

          {/* plant (lifted so the readout never covers the pot) */}
          <g transform="translate(0 -46)">
            {LEAVES.map((l, i) => (
              <g key={i}>
                <path d={l.d} fill="rgb(var(--leaf))" fillOpacity=".14" stroke="rgb(var(--leaf))" strokeWidth="1.6" strokeLinejoin="round" />
                <path d={l.stripe} fill="none" stroke="rgb(var(--surface))" strokeWidth="1.4" strokeLinecap="round" opacity=".9" />
              </g>
            ))}
            {/* runner with a plantlet */}
            <path d="M232,296 C300,280 350,300 362,352" fill="none" stroke="rgb(var(--leaf))" strokeWidth="1.3" />
            {[[-40, 24], [-10, 30], [20, 26], [50, 20]].map(([a, l], i) => {
              const rad = ((90 + a) * Math.PI) / 180;
              return <path key={i} d={`M362,352 q${Math.cos(rad) * l * 0.4 + 6},${-Math.sin(rad) * l * 0.6} ${Math.cos(rad) * l},${-Math.sin(rad) * l * 0.9}`} fill="none" stroke="rgb(var(--leaf))" strokeWidth="1.5" strokeLinecap="round" />;
            })}
            {/* pot */}
            <path d="M178,300 H262 L252,368 Q250,376 242,376 H198 Q190,376 188,368 Z" fill="rgb(var(--surface))" stroke="rgb(var(--ink))" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M172,296 H268 V306 H172 Z" fill="rgb(var(--surface))" stroke="rgb(var(--ink))" strokeWidth="1.6" strokeLinejoin="round" />
          </g>

          {/* probe crosshair */}
          {probe && (
            <g pointerEvents="none">
              <line x1={probe.x} x2={probe.x} y1={0} y2={H} stroke="rgb(var(--ink))" strokeOpacity=".15" strokeDasharray="3 4" />
              <line y1={probe.y} y2={probe.y} x1={0} x2={W} stroke="rgb(var(--ink))" strokeOpacity=".15" strokeDasharray="3 4" />
              <circle cx={probe.x} cy={probe.y} r={70} fill="none" stroke="rgb(var(--signal))" strokeOpacity=".4" strokeDasharray="2 5" />
            </g>
          )}
        </svg>

        {/* readout */}
        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 rounded-2xl border border-line bg-surface/90 px-4 py-3 backdrop-blur sm:inset-x-5 sm:bottom-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-signal" />
              {t.home.vizReadout}
              <DemoBadge />
            </div>
            <p className="mt-0.5 truncate text-[11px] text-muted/80">{t.home.vizDemo}{probe ? ` · ${nearCount}` : ''}</p>
          </div>
          <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="h-9 w-32 shrink-0 sm:w-44" aria-hidden>
            <polyline points={spark} fill="none" stroke="rgb(var(--signal))" strokeWidth="1.6" vectorEffect="non-scaling-stroke" style={{ transition: 'all .8s ease' }} />
          </svg>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs text-muted"><i>Chlorophytum comosum</i></figcaption>
    </figure>
  );
}
