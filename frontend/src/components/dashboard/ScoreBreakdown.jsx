import { useEffect, useState } from "react";

function getBarColor(pct) {
  if (pct >= 75) return "bg-green";
  if (pct >= 55) return "bg-yellow-400";
  return "bg-rose-500";
}

function Bar({ label, pct, delay, dimmed }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 300 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);

  const colorClass = getBarColor(pct);

  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[11px] text-muted font-mono w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-1.5 rounded-full transition-all duration-700 ease-out ${colorClass}`}
          style={{ width: `${width}%`, opacity: dimmed ? 0.45 : 1 }}
        />
      </div>
      <span className="text-[11px] text-[#f8faf8] font-mono w-8 text-right">{pct}%</span>
    </div>
  );
}

export default function ScoreBreakdown({
  technical,
  communication,
  behavioral,
  integrity,
  topStrengths = [],
  topImprovements = [],
}) {
  const hasData = technical || communication || behavioral;

  return (
    <div className="bg-surface border border-white/[0.06] rounded-xl p-4.5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-mono text-dim uppercase tracking-widest">
          avg score breakdown
        </span>
      </div>

      {!hasData ? (
        <div className="text-xs text-dim font-mono text-center py-6">
          Complete a session to see your breakdown.
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-3">
            <Bar label="Technical" pct={Math.round(technical ?? 0)} delay={0} />
            <Bar label="Comms" pct={Math.round(communication ?? 0)} delay={80} />
            <Bar label="Behavioral" pct={Math.round(behavioral ?? 0)} delay={160} />
            <Bar label="Integrity" pct={Math.round(integrity ?? 0)} delay={240} dimmed />
          </div>

          {(topStrengths.length > 0 || topImprovements.length > 0) && (
            <div className="mt-2 pt-4 border-t border-white/[0.06] flex flex-col gap-3">
              <div className="text-[10px] font-mono text-dim uppercase tracking-widest">
                Latest Session Feedback
              </div>
              <div className="grid grid-cols-2 gap-4">
                {topStrengths.length > 0 && (
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <span className="text-[10px] text-green font-semibold uppercase tracking-wider">Strengths</span>
                    <ul className="list-disc list-inside text-[11px] text-muted space-y-1">
                      {topStrengths.slice(0, 2).map((s, i) => (
                        <li key={i} className="truncate" title={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {topImprovements.length > 0 && (
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <span className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider font-mono">To Improve</span>
                    <ul className="list-disc list-inside text-[11px] text-muted space-y-1">
                      {topImprovements.slice(0, 2).map((imp, i) => (
                        <li key={i} className="truncate" title={imp}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}