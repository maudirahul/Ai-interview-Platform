import { useNavigate } from "react-router-dom";

export default function StartCard() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between bg-green-muted border border-green/20 rounded-xl px-5 py-5 gap-4">
      <div>
        <h3 className="text-[15px] font-semibold text-[#f8faf8] tracking-tight mb-1">
          Ready for your next session?
        </h3>
        <p className="text-xs text-muted">Pick a role and start practicing right now.</p>
      </div>
      <button
        onClick={() => navigate("/select-role")}
        className="bg-green text-bg text-sm font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 "
      >
        Start interview →
      </button>
    </div>
  );
}