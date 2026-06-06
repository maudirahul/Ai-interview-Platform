import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "../components/dashboard/Navbar";
import * as api from "../services/api";

function timeAgo(dateStr) {
  if (!dateStr) return "not started";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)} weeks ago`;
}

function statusClass(status) {
  if (status === "completed") return "bg-green-muted text-green-DEFAULT";
  if (status === "in_progress") return "bg-yellow-400/10 text-yellow-400";
  return "bg-white/5 text-muted";
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = await getAccessTokenSilently();
        const data = await api.getSessionHistory(token);
        setSessions(data.sessions || []);
      } catch (err) {
        console.error("History fetch error:", err);
        setError("Could not load your session history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [getAccessTokenSilently]);

  return (
    <div className="min-h-screen bg-bg text-[#f8faf8] font-sans">
      <Navbar />
      <main className="px-10 py-7">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="text-[11px] font-mono text-dim uppercase tracking-widest mb-2">
              interview history
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">All sessions</h1>
          </div>
          <button
            onClick={() => navigate("/select-role")}
            className="bg-[#4ade80] text-[#0a0f0d] text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            + New session
          </button>
        </div>

        <div className="bg-surface border border-white/6 rounded-xl p-4">
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="w-7 h-7 border-2 border-green/20 border-t-green rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-sm text-rose-400 font-mono text-center py-10">{error}</div>
          ) : sessions.length === 0 ? (
            <div className="text-sm text-dim font-mono text-center py-10">
              No interviews yet. Start a session to build your history.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {sessions.map((session) => (
                <button
                  key={session._id}
                  onClick={() => session.reportId && navigate(`/report/${session._id}`)}
                  disabled={!session.reportId}
                  className="w-full text-left flex items-center justify-between gap-4 px-4 py-3 bg-surface2 rounded-lg border border-white/6 hover:border-green-DEFAULT/20 transition-colors disabled:cursor-default disabled:hover:border-white/6"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-[#f8faf8] truncate">
                      {session.roleLabel || session.role || "Interview session"}
                    </div>
                    <div className="text-[11px] text-dim font-mono mt-1">
                      {session.level || "level"} · {timeAgo(session.completedAt || session.startedAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[11px] font-mono px-2 py-1 rounded ${statusClass(session.status)}`}>
                      {session.status?.replace("_", " ") || "unknown"}
                    </span>
                    <span className="text-[11px] font-mono text-muted">
                      {session.reportId ? "view report" : "no report"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
