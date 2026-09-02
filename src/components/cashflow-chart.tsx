"use client";

import { useState } from "react";
import { formatIDR, formatIDRCompact } from "@/lib/format";

export type CashflowBucket = {
  /** Short axis label, e.g. "Sep" or "12/9". */
  label: string;
  /** Full period name for the readout, e.g. "September 2026". */
  fullLabel: string;
  income: number;
  expense: number;
};

const W = 320;
const HALF = 48;
const AXIS = 8 + HALF;
const FLOOR = AXIS + HALF;
const LABEL_Y = FLOOR + 14;
const H = LABEL_Y + 6;

/** Bar with only its outer end rounded, so it stays anchored to the zero line. */
function barPath(x: number, w: number, height: number, up: boolean) {
  const r = Math.min(4, w / 2, height);
  const end = up ? AXIS - height : AXIS + height;
  const inward = up ? 1 : -1;
  return [
    `M ${x} ${AXIS}`,
    `L ${x} ${end + r * inward}`,
    `Q ${x} ${end} ${x + r} ${end}`,
    `L ${x + w - r} ${end}`,
    `Q ${x + w} ${end} ${x + w} ${end + r * inward}`,
    `L ${x + w} ${AXIS}`,
    "Z",
  ].join(" ");
}

export function CashflowChart({
  buckets,
  windowLabel,
}: {
  buckets: CashflowBucket[];
  windowLabel: string;
}) {
  const [focus, setFocus] = useState(buckets.length - 1);

  const peak = Math.max(...buckets.flatMap((b) => [b.income, b.expense]), 1);
  const band = W / buckets.length;
  const barW = Math.min(band * 0.38, 16);
  const scale = (v: number) => (v / peak) * HALF;

  const active = buckets[Math.min(focus, buckets.length - 1)];
  const net = active.income - active.expense;

  return (
    <div className="card p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold text-charcoal">Arus Kas</h2>
          <p className="truncate text-[12px] text-muted">{windowLabel}</p>
        </div>
        <div className="min-w-0 shrink-0 text-right">
          <p className="truncate text-[12px] font-semibold text-charcoal">{active.fullLabel}</p>
          <p className={`tnum text-[13px] font-bold ${net >= 0 ? "text-cobalt" : "text-terracotta"}`}>
            {net >= 0 ? "Sisa " : "Kurang "}
            {formatIDRCompact(Math.abs(net))}
          </p>
        </div>
      </div>

      {/* No fixed height: the viewBox owns the aspect ratio, so the in-SVG axis
          labels stay locked to their bars at every width. */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`Grafik arus kas, ${windowLabel}`}
      >
        {buckets.map((b, i) => {
          const cx = i * band + band / 2;
          const focused = i === focus;
          return (
            <g key={b.label + i} onClick={() => setFocus(i)} style={{ cursor: "pointer" }}>
              <title>{`${b.fullLabel}: masuk ${formatIDR(b.income)}, keluar ${formatIDR(b.expense)}`}</title>

              {/* Focus reads as a highlight, not as dimming everything else —
                  every bar keeps full colour so the trend stays legible. */}
              {focused && (
                <rect
                  x={i * band + 1}
                  y="2"
                  width={band - 2}
                  height={LABEL_Y + 2}
                  rx="6"
                  fill="var(--color-sand)"
                />
              )}
              {/* Hit target wider than the marks, for thumbs. */}
              <rect x={i * band} y="0" width={band} height={H} fill="transparent" />

              {b.income > 0 && (
                <path
                  d={barPath(cx - barW - 1, barW, Math.max(scale(b.income), 2), true)}
                  fill="var(--color-cobalt)"
                />
              )}
              {b.expense > 0 && (
                <path
                  d={barPath(cx + 1, barW, Math.max(scale(b.expense), 2), false)}
                  fill="var(--color-terracotta)"
                />
              )}

              <text
                x={cx}
                y={LABEL_Y}
                textAnchor="middle"
                fontSize="9.5"
                fontWeight={focused ? 700 : 500}
                fill={focused ? "var(--color-charcoal)" : "var(--color-muted)"}
              >
                {b.label}
              </text>
            </g>
          );
        })}

        <line x1="0" y1={AXIS} x2={W} y2={AXIS} stroke="var(--color-border)" strokeWidth="1" />
      </svg>

      <div className="mt-2 flex items-center justify-between gap-3 border-t border-border pt-3">
        <span className="flex min-w-0 items-center gap-1.5 text-[12px] text-muted">
          <span className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-cobalt" />
          Masuk
          <strong className="tnum truncate font-bold text-charcoal">{formatIDRCompact(active.income)}</strong>
        </span>
        <span className="flex min-w-0 items-center gap-1.5 text-[12px] text-muted">
          <span className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-terracotta" />
          Keluar
          <strong className="tnum truncate font-bold text-charcoal">{formatIDRCompact(active.expense)}</strong>
        </span>
      </div>
    </div>
  );
}
