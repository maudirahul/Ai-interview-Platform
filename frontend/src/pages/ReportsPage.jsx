import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "../components/dashboard/Navbar";
import * as api from "../services/api";

function formatDate(dateStr) {
  if (!dateStr) return "unknown date";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}

function scoreClass(score) {
  if (score >= 75) return "text-green-DEFAULT";
  if (score >= 55) return "text-yellow-400";
  return "text-rose-400";
}

export default function ReportsPage() {
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = await getAccessTokenSilently();
        const data = await api.getAllReports(token);
        setReports(data.reports || []);
      } catch (err) {
        console.error("Reports fetch error:", err);
        setError("Could not load your reports.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [getAccessTokenSilently]);

  return (
    <div className="min-h-screen bg-bg text-[#f8faf8] font-sans">
      <Navbar />
      <main className="px-10 py-7 animate-page-fade">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="text-[11px] font-mono text-dim uppercase tracking-widest mb-2">
              generated reports
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Performance reports</h1>
          </div>
          <button
            onClick={() => navigate("/history")}
            className="text-xs font-semibold px-4 py-2 rounded-lg border border-white/10 text-muted hover:text-[#f8faf8] hover:border-white/20 transition-colors"
          >
            View history
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-7 h-7 border-2 border-green/20 border-t-green rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-surface border border-white/6 rounded-xl p-10 text-sm text-rose-400 font-mono text-center">
            {error}
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-surface border border-white/6 rounded-xl p-10 text-sm text-dim font-mono text-center">
            No reports yet. Complete an interview to generate your first report.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {reports.map((report) => (
              <button
                key={report._id}
                onClick={() => report.sessionId && navigate(`/report/${report.sessionId}`)}
                className="text-left bg-surface border border-white/6 rounded-xl p-5 hover:border-green-DEFAULT/25 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-6">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {report.roleLabel || report.role || "Interview report"}
                    </div>
                    <div className="text-[11px] text-dim font-mono mt-1">
                      {report.level || "level"} · {formatDate(report.createdAt)}
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-green-DEFAULT bg-green-muted px-2 py-1 rounded">
                    {report.grade || "-"}
                  </span>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <div className={`text-4xl font-mono font-bold leading-none ${scoreClass(report.overallScore)}`}>
                      {report.overallScore ?? 0}
                    </div>
                    <div className="text-[11px] text-dim font-mono mt-1">overall score</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono text-[#f8faf8]">
                      {report.integrityScore ?? 100}%
                    </div>
                    <div className="text-[11px] text-dim font-mono mt-1">integrity</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}