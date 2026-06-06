import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState, useRef } from "react";

export default function Hero() {
  const { loginWithRedirect } = useAuth0();
  const heroRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const fadeIn = (delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(18px)",
    transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
  });

  return (
    <section
      className="py-12 px-10 flex flex-col items-center text-center relative "
      ref={heroRef}
    >
      <h1
        className="text-[56px] font-bold leading-[1.1] tracking-[-2.5px] mb-6 max-w-[600px]"
        style={fadeIn(100)}
      >
        Ace your next
        <br />
        <span className="text-green-400">interview</span>
      </h1>

      <p
        className="text-[16px] text-[#8a9e8e] leading-[1.7] max-w-[500px] mb-12"
        style={fadeIn(200)}
      >
        Practice with a real AI interviewer. Get scored on technical depth,
        communication, and behavioral clarity — then improve.
      </p>

      <div className="flex gap-3 items-center mb-16" style={fadeIn(300)}>
        <button
          className="bg-green-400 text-[#0a0f0d] text-[14px] font-semibold rounded-[10px] px-7 py-3 hover:bg-green-300 transition-colors cursor-pointer"
          onClick={() => loginWithRedirect({ screen_hint: "signup" })}
        >
          Start for free
        </button>
        <button
          className="bg-transparent border border-white/10 text-[#f8faf8] text-[14px] rounded-[10px] px-6 py-3 hover:bg-white/5 transition-colors cursor-pointer"
          onClick={() => {
            const el = document.getElementById("reports");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        >
          See a sample report
        </button>
      </div>

      <div
        className="flex border border-white/10 rounded-[10px] overflow-hidden w-full max-w-[640px]"
        style={fadeIn(420)}
      >
        {[
          { val: "7", unit: "Roles", lbl: "available now" },
          { val: "10", unit: "Questions", lbl: "per session" },
          { val: "3", unit: "Levels", lbl: "fresher · mid · senior" },
        ].map((s, idx) => (
          <div
            key={s.lbl}
            className={`flex-1 p-6 text-center ${idx !== 2 ? "border-r border-white/5" : ""}`}
          >
            <div className="text-[22px] font-bold text-[#f8faf8] tracking-[-0.5px] font-mono mb-1.5">
              <span className="text-green-400">{s.val}</span> {s.unit}
            </div>
            <div className="text-[11px] text-[#4a5e4e] uppercase tracking-[1.5px]">
              {s.lbl}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
