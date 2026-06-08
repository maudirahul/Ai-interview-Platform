import { useNavigate } from "react-router-dom";

export default function RefundsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-[#f8faf8] font-sans relative flex flex-col justify-between">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-green-muted/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Nav */}
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
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-16 relative z-10">
        <div className="bg-surface border border-white/5 rounded-2xl p-8 md:p-10 shadow-2xl relative">
          <div className="mb-8 border-b border-white/5 pb-6">
            <span className="text-[10px] font-bold tracking-widest text-green uppercase font-mono">
              billing policies
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight mt-1 text-[#f8faf8]">
              Refund & Cancellation
            </h1>
            <p className="text-xs text-muted mt-2 font-mono">
              Last updated: June 8, 2026
            </p>
          </div>

          <div className="space-y-6 text-xs text-muted leading-relaxed font-sans">
            <section>
              <h3 className="text-sm font-bold text-[#f8faf8] mb-2 font-mono">1. Cancellation Policy</h3>
              <p>
                As our products are digital services (AI practice interview credits) that are instantly added to your user profile upon successful transaction, cancellation of orders is only possible before the credits are used. If you have not utilized any credits from your purchased pack, you may request a cancellation within 48 hours of transaction.
              </p>
            </section>

            <section>
              <h3 className="text-sm font-bold text-[#f8faf8] mb-2 font-mono">2. Refund Eligibility</h3>
              <p>
                We want you to be fully satisfied with PrepAI. You are eligible for a full refund under the following conditions:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1.5">
                <li>The purchase pack credits remain completely unused (none of the sessions from the bundle have been initiated).</li>
                <li>The refund request is raised within 7 days of the date of purchase.</li>
                <li>There has been a technical malfunction during order checkout, causing a double-charge.</li>
              </ul>
              <p className="mt-2">
                Partial refunds for partially used session bundles are not supported.
              </p>
            </section>

            <section>
              <h3 className="text-sm font-bold text-[#f8faf8] mb-2 font-mono">3. How to Request a Refund</h3>
              <p>
                To request a refund, please send an email to <a href="mailto:maudirahul43489@gmail.com" className="text-green hover:underline">maudirahul43489@gmail.com</a> with the subject line "Refund Request - [Your Payment ID]".
              </p>
              <p className="mt-2">
                Please include your registered email address, transaction reference ID (available in your Transactions dashboard), and the reason for your refund request.
              </p>
            </section>

            <section>
              <h3 className="text-sm font-bold text-[#f8faf8] mb-2 font-mono">4. Processing & Refund Timelines</h3>
              <p>
                Once your request is received and verified, we will notify you of the approval or rejection of your refund. If approved, the refund will be processed and credited back to your original source of payment (via Razorpay) within 5 to 7 working days, in accordance with the policies of the card issuer/bank.
              </p>
            </section>
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
