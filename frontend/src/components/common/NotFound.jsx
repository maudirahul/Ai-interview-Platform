import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-[#f8faf8] font-sans relative overflow-hidden flex flex-col items-center justify-center px-4">
      {/* Noise overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative premium glows */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 translate-y-1/2 w-[300px] h-[300px] bg-green-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
        {/* Large 404 Badge */}
        <div className="relative mb-6">
          <div className="text-[120px] font-extrabold leading-none tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-[#f8faf8] to-emerald-800 opacity-90 select-none">
            404
          </div>
          {/* Subtle reflection overlay */}
          <div className="absolute -bottom-2 left-0 right-0 h-8 bg-gradient-to-t from-[#0a0f0d] to-transparent pointer-events-none" />
        </div>

        {/* Heading and details */}
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#f8faf8] mb-3">
          Page Not Found
        </h1>
        <p className="text-sm text-[#8a9e8e]/80 mb-8 leading-relaxed max-w-sm">
          The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
        </p>

        {/* Return Button */}
        <button
          onClick={() => navigate("/")}
          className="group relative flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/35 hover:to-green-500/35 border border-emerald-500/30 hover:border-emerald-400/50 rounded-xl text-emerald-400 font-medium text-sm transition-all duration-300 shadow-lg shadow-emerald-950/20 hover:shadow-emerald-400/10 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          Back to Home
        </button>
      </div>
    </div>
  );
}
