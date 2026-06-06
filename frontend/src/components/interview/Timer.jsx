import { useEffect, useRef, useState } from "react";

export default function Timer({ duration, isRunning, onTimeUp }) {
  const [remaining, setRemaining] = useState(duration);
  const intervalRef = useRef(null);

  useEffect(() => {
    setRemaining(duration);
  }, [duration]);

  useEffect(() => {
    if (!isRunning) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          if (onTimeUp) onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning, onTimeUp]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const formatted = `${mins}:${secs.toString().padStart(2, "0")}`;
  const pct = Math.round((remaining / duration) * 100);
  const isUrgent = remaining <= 30;
  const isWarning = remaining <= 60 && remaining > 30;

  const barColor = isUrgent
    ? "#f87171"
    : isWarning
    ? "#f59e0b"
    : "#4ade80";

  const timeColor = isUrgent
    ? "text-red-400"
    : isWarning
    ? "text-amber-400"
    : "text-[#f8faf8]";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] font-mono text-[#4a5e4e] uppercase tracking-widest">
          time remaining
        </span>
        <span className={`text-2xl font-bold font-mono ${timeColor}`}>
          {formatted}
        </span>
      </div>
      <div className="h-0.75 bg-white/6 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
    </div>
  );
}