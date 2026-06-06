const steps = [
  {
    num: "01",
    title: "Pick your role & level",
    desc: "Choose from MERN, React, Node.js, Python or Full Stack — at fresher, mid, or senior level.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M8 12h8M8 8h5" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Interview with AI voice",
    desc: "An AI avatar asks 10 questions with voice. Answer naturally — your mic records each response.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Get your full report",
    desc: "Scored across Technical, Communication, and Behavioral — with per-question breakdown and shareable link.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20h16M4 4h16M9 4v16M15 4v16" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-2 px-20 max-w-[1200px] mx-auto w-full relative z-10 box-border">
      <div className="flex items-center gap-4 mb-10">
        <span className="text-[12px] font-mono text-green-400 tracking-[2px] uppercase whitespace-nowrap">how it works</span>
        <div className="flex-1 h-[0.5px] bg-white/10" />
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        {steps.map((s) => (
          <div key={s.num} className="bg-[#111a14] border border-white/5 rounded-2xl p-8">
            <div className="text-[12px] font-mono text-green-400/70 mb-4">{s.num}</div>
            <div className="w-10 h-10 bg-green-400/10 rounded-[10px] flex items-center justify-center text-green-400 mb-5">
              {s.icon}
            </div>
            <div className="text-[15px] font-semibold text-[#f8faf8] mb-3">{s.title}</div>
            <div className="text-[13px] text-[#8a9e8e] leading-[1.6]">{s.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}