import { useAuth0 } from "@auth0/auth0-react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "History", path: "/history" },
  { label: "Reports", path: "/reports" },
];

export default function Navbar() {
  const { user: auth0User, isAuthenticated, isLoading, logout } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();
  const reduxUser = useSelector((state) => state.auth.user);
  const activeUser = auth0User || reduxUser;

  let initials = "?";
  if (activeUser) {
    const displayName = activeUser.name || activeUser.nickname || activeUser.email || "U";
    initials = displayName
      .split(/[ @.-]+/) // Splits by space, @, dot, or dash
      .filter(Boolean)  // Removes empty strings
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-10 py-4 bg-bg border-b border-white/6">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#4ade80]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="#0a0f0d"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 8l3 3 7-7" />
          </svg>
        </div>
        <span className="text-[16px] font-semibold tracking-tight text-[#f8faf8]">
          PrepAI
        </span>
      </div>

      {/* Nav links */}
      <div className="flex gap-1">
        {navItems.map((item) => (
          <span
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`text-[16px] px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
              location.pathname === item.path
                ? "bg-surface text-[#f8faf8] border border-white/10"
                : "text-muted hover:text-[#f8faf8]"
            }`}
          >
            {item.label}
          </span>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2.5">
        
        {/* AVATAR LOGIC */}
        {isLoading ? (
          // Shows a pulsing empty circle while Auth0 is loading
          <div className="w-8 h-8 rounded-full bg-green-muted/30 border border-green-DEFAULT/10 animate-pulse"></div>
        ) : (
          // Shows the initials once loaded
          <div className="w-8 h-8 rounded-full bg-green-muted border border-green-DEFAULT/30 flex items-center justify-center text-[11px] font-semibold text-green-DEFAULT">
            {initials}
          </div>
        )}

        <button
          onClick={() => navigate("/select-role")}
          className="bg-[#4ade80] text-[15px] text-xs font-semibold px-3.5 py-1.5 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
        >
          + New session
        </button>
        
        <button
          onClick={() =>
            logout({ logoutParams: { returnTo: window.location.origin } })
          }
          className="text-[15px] text-muted px-3.5 py-1.5 rounded-lg border border-white/10 hover:text-red-400 transition-colors cursor-pointer"
        >
          Log out
        </button>
      </div>
    </nav>
  );
}