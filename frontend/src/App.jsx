import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import ProtectedRoute from "./components/common/ProtectedRoute";
import LandingOrLoader from "./components/common/LandingOrLoader";
import Dashboard from "./pages/Dashboard";
import HistoryPage from "./pages/HistoryPage";
import RoleSelector from "./pages/RoleSelector";
import InterviewRoom from "./pages/InterviewRoom";
import ReportPage from "./pages/ReportPage";
import ReportsPage from "./pages/ReportsPage";
import NotFound from "./components/common/NotFound";

function AuthRedirect() {
  const { isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && location.pathname === "/") navigate("/dashboard");
  }, [isAuthenticated, location.pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthRedirect />
      <Routes>
        <Route path="/" element={<LandingOrLoader />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/select-role"
          element={
            <ProtectedRoute>
              <RoleSelector />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/:sessionId"
          element={
            <ProtectedRoute>
              <InterviewRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report/:sessionId"
          element={
            <ProtectedRoute>
              <ReportPage />
            </ProtectedRoute>
          }
        />
        <Route path="/share/:shareToken" element={<ReportPage shared />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
