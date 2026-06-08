import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/dashboard/Navbar";
import WelcomeBanner from "../components/dashboard/WelcomeBanner";
import StatsRow from "../components/dashboard/StatsRow";
import RecentSessions from "../components/dashboard/RecentSessions";
import ScoreBreakdown from "../components/dashboard/ScoreBreakdown";
import RolesPicker from "../components/dashboard/RolePicker";
import StartCard from "../components/dashboard/StartCard";
import Footer from "../components/landingPage/Footer";
import { setUser } from "../store/slices/authSlice";
import * as api from "../services/api";

export default function Dashboard() {
  const { getAccessTokenSilently, user: auth0User, loginWithRedirect } = useAuth0();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [sessions, setSessions] = useState([]);
  const [reports, setReports] = useState([]);
  const [scores, setScores] = useState({
    technical: 0,
    communication: 0,
    behavioral: 0,
    integrity: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getAccessTokenSilently();

        const [userData, historyData] = await Promise.all([
          api.getMe(token),
          api.getSessionHistory(token),
        ]);

        if (userData.success) dispatch(setUser(userData.user));

        if (historyData.success && historyData.sessions?.length) {
          setSessions(historyData.sessions);

          const completed = historyData.sessions.filter(
            (s) => s.status === "completed" && s.reportId,
          );

          if (completed.length > 0) {
            const reportData = await api.getAllReports(token);

            if (reportData.success && reportData.reports?.length) {
              setReports(reportData.reports);

              const avg = (key) =>
                Math.round(
                  reportData.reports.reduce(
                    (sum, r) => sum + (r[key]?.subtotal ?? 0),
                    0,
                  ) / reportData.reports.length,
                );

              const avgIntegrity = Math.round(
                reportData.reports.reduce(
                  (sum, r) => sum + (r.integrityScore ?? 0),
                  0,
                ) / reportData.reports.length,
              );

              setScores({
                technical: avg("technicalScore"),
                communication: avg("communicationScore"),
                behavioral: avg("behavioralScore"),
                integrity: avgIntegrity,
              });
            }
          }
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        if (
          err.error === "login_required" ||
          err.error === "invalid_grant" ||
          err.message?.includes("Missing Refresh Token") ||
          err.message?.includes("invalid_grant") ||
          err.message?.includes("Login required")
        ) {
          loginWithRedirect();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const bestReport = reports.length
    ? reports.reduce(
        (best, r) =>
          (r.overallScore ?? 0) > (best.overallScore ?? 0) ? r : best,
        reports[0],
      )
    : null;

  const avgScore = reports.length
    ? Math.round(
        reports.reduce((sum, r) => sum + (r.overallScore ?? 0), 0) /
          reports.length,
      )
    : null;

  const displayName =
    auth0User?.name ||
    auth0User?.nickname ||
    auth0User?.email?.split("@")[0] ||
    "there";

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green/20 border-t-green rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-[#f8faf8] font-sans">
      <Navbar />
      <div className="px-10 py-7 animate-page-fade">
        <WelcomeBanner
          name={displayName}
          sessionBalance={user?.sessionBalance ?? 0}
        />
        <StatsRow
          totalSessions={user?.totalSessions ?? 0}
          sessionBalance={user?.sessionBalance ?? 0}
          avgScore={avgScore}
          bestGrade={bestReport?.grade}
          bestGradeRole={
            bestReport ? `${bestReport.roleLabel} · ${bestReport.level}` : null
          }
        />
        <div className="grid grid-cols-2 gap-3 mb-3">
          <RecentSessions sessions={sessions} />
          <ScoreBreakdown
            technical={scores.technical ? (scores.technical / 50) * 100 : 0}
            communication={
              scores.communication ? (scores.communication / 25) * 100 : 0
            }
            behavioral={scores.behavioral ? (scores.behavioral / 25) * 100 : 0}
            integrity={scores.integrity ?? 0}
            topStrengths={reports[0]?.topStrengths ?? []}
            topImprovements={reports[0]?.topImprovements ?? []}
          />
        </div>
        <RolesPicker />
        <StartCard />
      </div>
      <Footer />
    </div>
  );
}
