import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#0a0f0d] border-t border-white/5 py-8 mt-auto relative z-10">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo and Copyright */}
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-[5px] bg-[#4ade80]">
            <svg
              width="10"
              height="10"
              viewBox="0 0 16 16"
              fill="none"
              stroke="#0a0f0d"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 8l3 3 7-7" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-[#f8faf8]">
            NextRound
          </span>
          <span className="text-xs text-dim font-mono ml-2">
            © {year} All rights reserved.
          </span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 text-xs font-medium text-muted">
          <span
            onClick={() => navigate("/contact")}
            className="hover:text-[#f8faf8] cursor-pointer transition-colors"
          >
            Contact Us
          </span>
          <span
            onClick={() => navigate("/privacy")}
            className="hover:text-[#f8faf8] cursor-pointer transition-colors"
          >
            Privacy Policy
          </span>
          <span
            onClick={() => navigate("/terms")}
            className="hover:text-[#f8faf8] cursor-pointer transition-colors"
          >
            Terms of Service
          </span>
          <span
            onClick={() => navigate("/refunds")}
            className="hover:text-[#f8faf8] cursor-pointer transition-colors"
          >
            Refund Policy
          </span>
        </div>
      </div>
    </footer>
  );
}
