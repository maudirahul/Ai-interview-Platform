import { useNavigate } from "react-router-dom";

export default function ContactPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-[#f8faf8] font-sans relative flex flex-col justify-between">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-green-muted/20 rounded-full blur-[150px] pointer-events-none" />

      {/* Nav logo only */}
      <nav className="flex items-center justify-between px-10 py-6 bg-[#0a0f0d] border-b border-white/5 relative z-10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-[#4ade80]">
            <svg
              width="12"
              height="12"
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
          <span className="text-md font-semibold tracking-tight text-[#f8faf8]">
            PrepAI
          </span>
        </div>
        <button
          onClick={() => navigate("/")}
          className="text-xs font-semibold px-4 py-2 rounded-lg border border-white/10 text-muted hover:text-[#f8faf8] hover:border-white/20 transition-all cursor-pointer"
        >
          Back to Home
        </button>
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-16 relative z-10 flex flex-col justify-center">
        <div className="bg-surface border border-white/5 rounded-2xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green/5 rounded-full blur-2xl pointer-events-none" />

          <div className="mb-8">
            <span className="text-[10px] font-bold tracking-widest text-green uppercase font-mono">
              reach out
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight mt-1 text-[#f8faf8]">
              Contact Us
            </h1>
            <p className="text-xs text-muted mt-2">
              If you have any questions, feedback, or technical support inquiries regarding your sessions, feel free to contact us.
            </p>
          </div>

          <div className="space-y-6 text-sm text-muted">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="text-lg bg-green-muted text-green w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                ✉️
              </div>
              <div>
                <h4 className="text-xs font-bold font-mono text-green uppercase tracking-wide">Support Email</h4>
                <a href="mailto:maudirahul43489@gmail.com" className="text-sm font-semibold text-[#f8faf8] hover:text-green transition-colors mt-0.5 block">
                  maudirahul43489@gmail.com
                </a>
                <p className="text-[11px] text-muted mt-1">We typically respond within 24 hours.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="text-lg bg-green-muted text-green w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                📞
              </div>
              <div>
                <h4 className="text-xs font-bold font-mono text-green uppercase tracking-wide">Phone Support</h4>
                <a href="tel:+917735045505" className="text-sm font-semibold text-[#f8faf8] hover:text-green transition-colors mt-0.5 block">
                  +91 7735045505
                </a>
                <p className="text-[11px] text-muted mt-1">Available Monday to Friday, 10:00 AM – 6:00 PM IST.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="text-lg bg-green-muted text-green w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                📍
              </div>
              <div>
                <h4 className="text-xs font-bold font-mono text-green uppercase tracking-wide">Business Address</h4>
                <p className="text-sm font-semibold text-[#f8faf8] mt-0.5">
                  Bhubaneswar, Odisha, India
                </p>
                <p className="text-[11px] text-muted mt-1">PrepAI Operations & Support Headquarters.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Compact footer */}
      <footer className="py-6 border-t border-white/5 text-center text-[10px] text-dim font-mono relative z-10">
        PrepAI • Secured Sandbox Compliance • All rights reserved
      </footer>
    </div>
  );
}
