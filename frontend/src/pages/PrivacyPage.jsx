import { useNavigate } from "react-router-dom";

export default function PrivacyPage() {
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
              legal terms
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight mt-1 text-[#f8faf8]">
              Privacy Policy
            </h1>
            <p className="text-xs text-muted mt-2 font-mono">
              Last updated: June 8, 2026
            </p>
          </div>

          <div className="space-y-6 text-xs text-muted leading-relaxed font-sans">
            <section>
              <h3 className="text-sm font-bold text-[#f8faf8] mb-2 font-mono">1. Introduction</h3>
              <p>
                Welcome to PrepAI. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            <section>
              <h3 className="text-sm font-bold text-[#f8faf8] mb-2 font-mono">2. The Data We Collect About You</h3>
              <p>
                We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1.5">
                <li><strong>Identity Data</strong> includes first name, last name, and nickname/username (provided by your Auth0 credentials).</li>
                <li><strong>Contact Data</strong> includes email address and contact numbers.</li>
                <li><strong>Financial Data</strong> includes payment details processed securely via Razorpay (we do not store your complete card credentials on our servers).</li>
                <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type, and version, time zone setting and location, browser plug-in types, operating system, and platform.</li>
                <li><strong>Interview & Voice Data</strong> includes audio recordings and transcripts recorded during your practice interview sessions to generate performance scorecards.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-sm font-bold text-[#f8faf8] mb-2 font-mono">3. How We Use Your Personal Data</h3>
              <p>
                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1.5">
                <li>To register you as a new user.</li>
                <li>To process and deliver your credits purchase orders (managed by Razorpay).</li>
                <li>To run, process, and score your practice interview sessions.</li>
                <li>To notify you about changes to our terms or privacy policy.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-sm font-bold text-[#f8faf8] mb-2 font-mono">4. Data Security</h3>
              <p>
                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, contractors, and partners who have a business need to know.
              </p>
            </section>

            <section>
              <h3 className="text-sm font-bold text-[#f8faf8] mb-2 font-mono">5. Contact Information</h3>
              <p>
                If you have any questions about this privacy policy or our privacy practices, please contact us at <a href="mailto:maudirahul43489@gmail.com" className="text-green hover:underline">maudirahul43489@gmail.com</a>.
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
