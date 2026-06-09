import { useNavigate } from "react-router-dom";

function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 week ago";
  return `${Math.floor(days / 7)} weeks ago`;
}

function scorePillClass(score) {
  if (!score) return "bg-white/5 text-muted";
  if (score >= 75) return "bg-green-muted text-green-DEFAULT";
  if (score >= 55) return "bg-white/5 text-muted";
  return "bg-red-500/10 text-red-400";
}

export default function RecentSessions({ sessions = [] }) {
  const navigate = useNavigate();

  return (
    <div className="bg-surface border border-white/[0.06] rounded-xl p-4.5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-mono text-dim uppercase tracking-widest">
          recent sessions
        </span>
        <span
          className="text-[11px] text-muted cursor-pointer hover:text-[#f8faf8] transition-colors"
          onClick={() => navigate("/history")}
        >
          view all →
        </span>
      </div>

      {sessions.length === 0 ? (
        <div className="text-xs text-dim font-mono text-center py-6">
          No sessions yet. Start your first interview.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sessions.slice(0, 4).map((s) => (
            <div
              key={s._id}
              onClick={() => s.reportId && navigate(`/report/${s._id}`)}
              className="flex items-center justify-between px-3 py-2.5 bg-surface2 rounded-lg border border-white/[0.06] cursor-pointer hover:border-green-DEFAULT/20 transition-colors"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-[#f8faf8]">
                  {s.roleLabel}
                </span>
                <span className="text-[11px] text-dim font-mono">
                  {s.level} · {timeAgo(s.completedAt || s.startedAt)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {s.reportId ? (
                  <span className="text-[11px] text-green hover:underline font-mono">
                    view report
                  </span>
                ) : (
                  <span className="text-[11px] text-dim font-mono italic">
                    {s.status === "in_progress" ? "in progress" : "no report"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
