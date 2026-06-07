import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import * as api from "../services/api";

export default function ReportPage({ shared = false }) {
  const { sessionId, shareToken } = useParams();
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareStatus, setShareStatus] = useState("");

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const data = shared
          ? await api.getSharedReport(shareToken)
          : await api.getReport(await getAccessTokenSilently(), sessionId);

        setReport(data.report || data);
      } catch (err) {
        console.error("Failed to fetch report:", err);
        setError("Could not load report data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [sessionId, shareToken, shared, getAccessTokenSilently]);

  const handleShareReport = async () => {
    if (!report?.shareToken) {
      setShareStatus("Share link unavailable");
      return;
    }

    const shareUrl = `${window.location.origin}/share/${report.shareToken}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus("Link copied");
    } catch (err) {
      console.error("Clipboard error:", err);
      window.prompt("Copy report link", shareUrl);
      setShareStatus("Ready to share");
    }

    window.setTimeout(() => setShareStatus(""), 2200);
  };

  // ── Helper for dynamic progress bar colors ──
  const getScoreStyle = (score) => {
    if (score >= 80) return { text: "text-[#4ade80]", bg: "bg-[#4ade80]" };
    if (score >= 60) return { text: "text-yellow-400", bg: "bg-yellow-400" };
    return { text: "text-rose-500", bg: "bg-rose-500" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090e0c] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#4ade80]/20 border-t-[#4ade80] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#090e0c] flex flex-col items-center justify-center text-white gap-4">
        <p className="text-rose-500 font-mono">{error || "Report not found"}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm underline text-gray-400 hover:text-white"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090e0c] text-[#f8faf8] font-sans pb-20">
      {/* ── TOP NAV ── */}
      <nav className="flex items-center justify-between px-10 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#4ade80] rounded-md flex items-center justify-center">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="#090e0c"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1.5 6l2.5 2.5 6-6" />
            </svg>
          </div>
          <span className="text-sm font-bold tracking-tight">PrepAI</span>
        </div>

        <div className={`flex items-center gap-3 ${shared ? "hidden" : ""}`}>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-xs font-semibold px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
          >
            ← Dashboard
          </button>
          <button
            onClick={handleShareReport}
            className="text-xs font-semibold px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
          >
            {shareStatus || "Share report"}
          </button>
          <button
            onClick={() => navigate("/select-role")}
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            + New session
          </button>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-5xl mx-auto px-6 mt-10 space-y-10 animate-page-fade">
        {/* TOP STATS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Score Card */}
          <div className="lg:col-span-4 bg-[#121815] border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
            <h1 className="text-7xl font-bold text-[#4ade80] tracking-tighter mb-2">
              {report.overallScore}
            </h1>
            <span className="text-2xl font-bold text-white mb-6">
              {report.grade}
            </span>
            <div className="text-[11px] font-mono text-gray-500 uppercase tracking-widest mb-1">
              Overall Score
            </div>
            <div className="text-sm text-gray-400">
              {report.roleLabel} · {report.level}
            </div>
          </div>

          {/* Sub Scores & Integrity */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Category Scores */}
            <div className="grid grid-cols-3 gap-4 flex-1">
              {[
                {
                  title: "Technical",
                  score: report.technicalScore?.subtotal,
                  max: 50,
                  labels: "accuracy · depth · problem solving",
                },
                {
                  title: "Communication",
                  score: report.communicationScore?.subtotal,
                  max: 25,
                  labels: "clarity · structure · confidence",
                },
                {
                  title: "Behavioral",
                  score: report.behavioralScore?.subtotal,
                  max: 25,
                  labels: "relevance · examples · professionalism",
                },
              ].map((cat) => (
                <div
                  key={cat.title}
                  className="bg-[#121815] border border-white/5 rounded-2xl p-6 flex flex-col justify-between"
                >
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-4">
                    {cat.title}
                  </div>
                  <div className="flex items-end gap-1 mb-3">
                    <span className="text-3xl font-bold">{cat.score || 0}</span>
                    <span className="text-sm text-gray-500 font-medium mb-1">
                      /{cat.max}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full mb-3 overflow-hidden">
                    <div
                      className="h-full bg-[#4ade80] rounded-full"
                      style={{
                        width: `${((cat.score || 0) / cat.max) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-gray-500 leading-tight">
                    {cat.labels}
                  </div>
                </div>
              ))}
            </div>

            {/* Integrity Metrics */}
            <div className="grid grid-cols-4 gap-4 h-24">
              {[
                {
                  label: "Integrity Score",
                  value:
                    report.integrityDetails?.integrityScore ||
                    report.integrityScore ||
                    100,
                  color: "text-[#4ade80]",
                },
                {
                  label: "Look Away",
                  value: report.integrityDetails?.lookAwayCount || 0,
                  color: "text-[#4ade80]",
                },
                {
                  label: "Phone Detected",
                  value: report.integrityDetails?.phoneDetectedCount || 0,
                  color: "text-[#4ade80]",
                },
                {
                  label: "Multiple Persons",
                  value: report.integrityDetails?.multiplePersonCount || 0,
                  color: "text-[#4ade80]",
                },
              ].map((metric, i) => (
                <div
                  key={i}
                  className="bg-[#121815] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center"
                >
                  <span className={`text-2xl font-bold mb-1 ${metric.color}`}>
                    {metric.value}
                  </span>
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                    {metric.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FEEDBACK SECTION */}
        <div>
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-[11px] font-mono text-[#4ade80] uppercase tracking-widest">
              Feedback
            </h3>
            <div className="flex-1 h-px bg-white/5"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#121815] border border-white/5 rounded-2xl p-6 md:p-8">
              <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-6">
                Top Strengths
              </h4>
              <ul className="space-y-4">
                {(report.topStrengths || []).map((strength, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm text-gray-300 leading-relaxed"
                  >
                    <span className="text-[#4ade80] mt-1">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#121815] border border-white/5 rounded-2xl p-6 md:p-8">
              <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-6">
                Areas to Improve
              </h4>
              <ul className="space-y-4">
                {(report.topImprovements || []).map((improvement, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm text-gray-300 leading-relaxed"
                  >
                    <span className="text-rose-400 mt-1">•</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* QUESTION BREAKDOWN */}
        <div>
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-[11px] font-mono text-[#4ade80] uppercase tracking-widest">
              Question Breakdown
            </h3>
            <div className="flex-1 h-px bg-white/5"></div>
          </div>

          <div className="space-y-4">
            {(report.questionBreakdown || []).map((q, index) => {
              const styles = getScoreStyle(q.score);
              return (
                <div
                  key={index}
                  className="bg-[#121815] border border-white/5 rounded-2xl p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-[#4ade80] bg-[#4ade80]/10 px-2 py-1 rounded uppercase tracking-wider">
                        {q.category?.replace(/_/g, " ") || "General"}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        Q{q.questionOrder} · {q.answerDuration}s
                      </span>
                    </div>
                    <span className={`text-xl font-bold ${styles.text}`}>
                      {q.score}
                    </span>
                  </div>

                  <p className="text-[15px] text-gray-200 font-medium mb-6 leading-relaxed">
                    {q.questionText}
                  </p>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${styles.bg}`}
                        style={{ width: `${q.score}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 font-medium">
                      {q.score}/100
                    </span>
                  </div>

                  {q.feedback && (
                    <p className="text-sm text-gray-400 italic leading-relaxed">
                      {q.feedback}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
