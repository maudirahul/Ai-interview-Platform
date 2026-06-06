import { useEffect, useState } from "react";

function AnimatedBar({ pct, delay = 0 }) {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 600 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  
  return (
    <div className="h-[3px] bg-green-400/10 rounded-sm">
      <div 
        className="h-[3px] bg-green-400 rounded-sm" 
        style={{ width: `${width}%`, transition: "width 0.9s cubic-bezier(0.4,0,0.2,1)" }} 
      />
    </div>
  );
}

export default function ReportPreview() {
  return (
    <section id="reports" className="py-5 px-20 max-w-[1200px] mx-auto w-full relative z-10 box-border">
      <div className="flex items-center gap-4 mb-10">
        <span className="text-[12px] font-mono text-green-400 tracking-[2px] uppercase whitespace-nowrap">sample report</span>
        <div className="flex-1 h-[0.5px] bg-white/10" />
      </div>
      
      <div className="bg-[#111a14] border border-white/5 rounded-[10px] p-10 grid grid-cols-[140px_1fr] gap-10 items-center">
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="text-[64px] font-bold text-green-400 tracking-[-3px] leading-none font-mono">74</div>
          <div className="text-[15px] font-semibold text-[#f8faf8]">B+</div>
          <div className="text-[12px] text-[#4a5e4e] font-mono">overall</div>
        </div>
        
        <div className="flex flex-col gap-5">
          {[
            { name: "Technical", pct: 68, delay: 0 },
            { name: "Communication", pct: 82, delay: 100 },
            { name: "Behavioral", pct: 74, delay: 200 },
            { name: "Integrity score", pct: 90, delay: 300 },
          ].map((b) => (
            <div key={b.name} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-[#8a9e8e]">{b.name}</span>
                <span className="text-[13px] font-mono text-[#f8faf8] font-semibold">{b.pct}%</span>
              </div>
              <AnimatedBar pct={b.pct} delay={b.delay} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}