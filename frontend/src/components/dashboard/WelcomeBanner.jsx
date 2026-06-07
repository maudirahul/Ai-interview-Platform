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
        <div 
          onClick={() => dispatch(openPricing())}
          className="flex items-center gap-1.5 bg-green-muted border border-green/20 rounded-full px-3 py-1 text-[11px] text-green font-mono cursor-pointer hover:bg-green/20 transition-colors"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-green" />
          Buy credits
        </div>
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