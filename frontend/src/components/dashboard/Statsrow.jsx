function StatCard({ label, value, sub, accent }) {
  return (
    <div className="bg-surface border border-white/[0.06] rounded-xl p-4">
      <div className="text-[11px] text-dim font-mono uppercase tracking-wider mb-2">
        {label}
      </div>
      <div className={`text-2xl font-bold tracking-tight font-mono leading-none mb-1 ${accent ? "text-green-DEFAULT" : "text-[#f8faf8]"}`}>
        {value}
      </div>
      <div className="text-[11px] text-dim">{sub}</div>
    </div>
  );
}

export default function StatsRow({ totalSessions, sessionBalance, avgScore, bestGrade, bestGradeRole }) {
  return (
    <div className="grid grid-cols-4 gap-2.5 mb-6">
      <StatCard
        label="total sessions"
        value={totalSessions ?? 0}
        sub="all time"
      />
      <StatCard
        label="session credits"
        value={sessionBalance ?? 0}
        sub="credits remaining"
        accent
      />
      <StatCard
        label="avg score"
        value={avgScore ? Math.round(avgScore) : "—"}
        sub="out of 100"
      />
      <StatCard
        label="best grade"
        value={bestGrade ?? "—"}
        sub={bestGradeRole ?? "no sessions yet"}
        accent={!!bestGrade}
      />
    </div>
  );
}