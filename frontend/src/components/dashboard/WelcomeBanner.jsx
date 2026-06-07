import { useDispatch } from "react-redux";
import { openPricing } from "../../store/slices/authSlice";

export default function WelcomeBanner({ name, sessionBalance }) {
  const dispatch = useDispatch();
  const firstName = name?.split(" ")[0] || "there";

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="mb-6">
      <div className="flex items-start justify-between mb-1">
        <h2 className="text-[22px] font-bold tracking-tight text-[#f8faf8]">
          {getGreeting()},{" "}
          <span className="text-green">{firstName}</span>
        </h2>
        <button
          onClick={() => dispatch(openPricing())}
          className="flex items-center gap-1 bg-green hover:bg-green/90 text-bg text-[11px] font-bold px-3.5 py-1.5 rounded-lg shadow-lg shadow-green/10 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer font-sans"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Buy Credits
        </button>
      </div>
      <p className="text-sm text-muted">
        You have <span className="text-[#f8faf8] font-semibold">{sessionBalance}</span> session credit{sessionBalance !== 1 ? "s" : ""} left.{" "}
        <span 
          onClick={() => dispatch(openPricing())}
          className="text-green hover:underline cursor-pointer font-medium"
        >
          Top up now
        </span>
      </p>
    </div>
  );
}