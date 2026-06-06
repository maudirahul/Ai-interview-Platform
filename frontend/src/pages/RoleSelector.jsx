import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useSelector, useDispatch } from "react-redux";
import * as api from "../services/api";
import { setSession } from "../store/slices/sessionSlice";

const ROLES = [
  {
    id: "mern_stack_developer",
    title: "MERN Stack",
    icon: "⚡",
    label: "MERN Stack Developer",
  },
  {
    id: "react_developer",
    title: "React Developer",
    icon: "⚛️",
    label: "React Developer",
  },
  {
    id: "nodejs_developer",
    title: "Node.js Developer",
    icon: "🟢",
    label: "Node.js Developer",
  },
  {
    id: "python_developer",
    title: "Python Developer",
    icon: "🐍",
    label: "Python Developer",
  },
  {
    id: "fullstack_developer",
    title: "Full Stack",
    icon: "🌐",
    label: "Full Stack Developer",
  },
  {
    id: "java_developer",
    title: "Java Developer",
    icon: "☕",
    label: "Java Developer",
  },
  { 
    id: "ai_ml", 
    title: "AI / ML Engineer", 
    icon: "🧠", 
    label: "AI ML" 
  },
];

const LEVELS = [
  {
    id: "fresher",
    title: "Fresher",
    desc: "0–1 years experience. Focus on fundamentals and core concepts.",
  },
  {
    id: "mid",
    title: "Mid",
    desc: "2–4 years experience. Practical application and problem solving.",
  },
  {
    id: "senior",
    title: "Senior",
    desc: "5+ years experience. Architecture, design, and leadership thinking.",
  },
];

export default function RoleSelector() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: auth0User, isLoading, getAccessTokenSilently } = useAuth0();
  const reduxUser = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);

  const activeUser = auth0User || reduxUser;
  const initials = activeUser
    ? (activeUser.name || activeUser.nickname || activeUser.email || "U")
        .split(/[ @.-]+/)
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const currentRoleId = searchParams.get("role") || "mern_stack_developer";
  const currentLevelId = searchParams.get("level") || "fresher";
  const selectedRole = ROLES.find((r) => r.id === currentRoleId) || ROLES[0];
  const selectedLevel =
    LEVELS.find((l) => l.id === currentLevelId) || LEVELS[0];

  const handleRoleSelect = (roleId) =>
    setSearchParams({ role: roleId, level: currentLevelId });
  const handleLevelSelect = (levelId) =>
    setSearchParams({ role: currentRoleId, level: levelId });

  const handleBeginInterview = async () => {
    if (starting) return;
    try {
      setStarting(true);
      setError(null);

      const token = await getAccessTokenSilently();

      // 1. Create session
      const sessionData = await api.createSession(token, {
        role: selectedRole.id,
        roleLabel: selectedRole.label,
        level: selectedLevel.id,
      });

      if (!sessionData.success) throw new Error("Failed to create session");

      const session = sessionData.session;

      // 2. Prepare questions
      const questionsData = await api.prepareQuestions(token, {
        role: selectedRole.id,
        roleLabel: selectedRole.label,
        level: selectedLevel.id,
      });

      if (!questionsData.success)
        throw new Error("Failed to prepare questions");

      // 3. Save to Redux
      dispatch(
        setSession({
          sessionId: session._id,
          role: session.role,
          roleLabel: session.roleLabel,
          level: session.level,
          questions: questionsData.questions,
          sessionStatus: session.status,
        }),
      );

      // 4. Navigate to interview room
      navigate(`/interview/${session._id}`);
    } catch (err) {
      console.error("Begin interview error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090e0c] text-[#f8faf8] font-sans flex flex-col">
      {/* NAV */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-10 py-4 bg-[#090e0c]/90 backdrop-blur-md border-b border-white/5">
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
          <span className="text-[16px] font-semibold tracking-tight">
            PrepAI
          </span>
        </div>
        {isLoading ? (
          <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#4ade80]/10 border border-[#4ade80]/30 flex items-center justify-center text-[11px] font-semibold text-[#4ade80]">
            {initials}
          </div>
        )}
      </nav>

      <div className="flex-1 px-10 pt-6 pb-8 flex flex-col justify-between max-w-4xl w-full mx-auto">
        <div>
          {/* Header */}
          <div className="mb-6">
            <span className="text-[11px] font-bold tracking-widest text-[#4ade80] uppercase">
              New Session
            </span>
            <h1 className="text-3xl font-bold tracking-tight mt-1.5 mb-2">
              Pick your role & level
            </h1>
            <p className="text-sm text-[#8a9e8e]">
              Choose what you want to be interviewed for. Questions will be
              tailored to your selection.
            </p>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-4 mb-8 text-xs font-medium">
            <div className="flex items-center gap-2 text-[#4ade80]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4ade80] text-[#090e0c] text-[10px] font-bold">
                ✓
              </span>
              <span>Role</span>
            </div>
            <div className="w-10 h-px bg-white/10" />
            <div className="flex items-center gap-2 text-[#4ade80]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#4ade80] text-[10px] font-bold">
                2
              </span>
              <span>Level</span>
            </div>
            <div className="w-10 h-px bg-white/10" />
            <div className="flex items-center gap-2 text-[#4a5e4e]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#4a5e4e] text-[10px] font-bold">
                3
              </span>
              <span>Start</span>
            </div>
          </div>

          {/* Roles */}
          <div className="mb-8">
            <h3 className="text-[10px] font-bold tracking-widest text-[#4a5e4e] uppercase mb-4">
              Choose a Role
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {ROLES.map((role) => {
                const isSelected = selectedRole.id === role.id;
                return (
                  <div
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className={`relative p-4 rounded-xl bg-[#121815] border cursor-pointer transition-all duration-200 select-none ${
                      isSelected
                        ? "border-[#4ade80]"
                        : "border-white/4 hover:border-white/10"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2.5 right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#4ade80] text-[#090e0c] text-[9px] font-bold">
                        ✓
                      </span>
                    )}
                    <div className="text-lg mb-3 bg-white/5 w-8 h-8 rounded-lg flex items-center justify-center">
                      {role.icon}
                    </div>
                    <h4
                      className={`text-xs font-semibold ${isSelected ? "text-[#4ade80]" : "text-[#f8faf8]"}`}
                    >
                      {role.title}
                    </h4>
                  </div>
                );
              })}
              <div className="col-span-3 md:col-span-3 bg-[#111a14] border border-white/5 rounded-xl p-4 flex items-center justify-center">
                <span className="text-xs text-[#4a5e4e] font-mono tracking-wider">
                  more coming soon
                </span>
              </div>
            </div>
          </div>

          {/* Levels */}
          <div className="mb-8">
            <h3 className="text-[10px] font-bold tracking-widest text-[#4a5e4e] uppercase mb-4">
              Choose a Level
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {LEVELS.map((level) => {
                const isSelected = selectedLevel.id === level.id;
                return (
                  <div
                    key={level.id}
                    onClick={() => handleLevelSelect(level.id)}
                    className={`p-4 rounded-xl bg-[#121815] border cursor-pointer transition-all duration-200 select-none ${
                      isSelected
                        ? "border-[#4ade80]"
                        : "border-white/4 hover:border-white/10"
                    }`}
                  >
                    <h4
                      className={`text-xs font-semibold mb-1 ${isSelected ? "text-[#4ade80]" : "text-[#f8faf8]"}`}
                    >
                      {level.title}
                    </h4>
                    <p className="text-[11px] text-[#8a9e8e] leading-relaxed">
                      {level.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Summary + CTA */}
        <div className="mt-auto">
          {error && (
            <div className="mb-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              {error}
            </div>
          )}
          <div className="p-4 rounded-xl bg-[#121815] border border-white/4 flex items-center justify-between mb-4">
            <div>
              <h5 className="text-xs font-semibold text-[#f8faf8]">
                {selectedRole.label} — {selectedLevel.title}
              </h5>
              <p className="text-[11px] text-[#4a5e4e] mt-1 font-mono">
                10 questions · ~20–30 mins · voice interview
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#4ade80]/10 text-[#4ade80]">
                {selectedRole.title}
              </span>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#4ade80]/10 text-[#4ade80]">
                {selectedLevel.title}
              </span>
            </div>
          </div>

          <button
            onClick={handleBeginInterview}
            disabled={starting}
            className="w-full bg-[#4ade80] hover:opacity-90 disabled:opacity-40 text-[#090e0c] font-semibold text-sm py-3.5 rounded-xl transition-all duration-200 cursor-pointer"
          >
            {starting ? "Setting up your session..." : "Begin interview →"}
          </button>
        </div>
      </div>
    </div>
  );
}
