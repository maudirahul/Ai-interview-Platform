import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useDispatch, useSelector } from "react-redux";
import ProtectedRoute from "./components/common/ProtectedRoute";
import LandingOrLoader from "./components/common/LandingOrLoader";
import Dashboard from "./pages/Dashboard";
import HistoryPage from "./pages/HistoryPage";
import RoleSelector from "./pages/RoleSelector";
import InterviewRoom from "./pages/InterviewRoom";
import ReportPage from "./pages/ReportPage";
import ReportsPage from "./pages/ReportsPage";
import TransactionsPage from "./pages/TransactionsPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import RefundsPage from "./pages/RefundsPage";
import NotFound from "./components/common/NotFound";
import { setUser } from "./store/slices/authSlice";
import * as api from "./services/api";

function AuthManager() {
  const { isAuthenticated, getAccessTokenSilently, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const reduxUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (isAuthenticated && location.pathname === "/") navigate("/dashboard");
  }, [isAuthenticated, location.pathname, navigate]);

  useEffect(() => {
    const syncUser = async () => {
      if (isAuthenticated && !reduxUser) {
        try {
          const token = await getAccessTokenSilently();
          const userData = await api.getMe(token);
          if (userData.success) {
            dispatch(setUser(userData.user));
          }
        } catch (err) {
          console.error("Failed to sync user details:", err);
          // If silent authentication fails due to session expiry or missing/invalid refresh tokens, redirect to login
          if (
            err.error === "login_required" ||
            err.error === "invalid_grant" ||
            err.message?.includes("Missing Refresh Token") ||
            err.message?.includes("invalid_grant") ||
            err.message?.includes("Login required")
          ) {
            loginWithRedirect();
          }
        }
      }
    };
    syncUser();
  }, [isAuthenticated, reduxUser, getAccessTokenSilently, dispatch, loginWithRedirect]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthManager />
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
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <TransactionsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/refunds" element={<RefundsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
