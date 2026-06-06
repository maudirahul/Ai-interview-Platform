export default function WelcomeBanner({ name, sessionsThisWeek, plan }) {
  const weeklyLimit = plan === "free" ? 5 : null;
  const remaining = weeklyLimit ? weeklyLimit - sessionsThisWeek : null;
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
        <div className="flex items-center gap-1.5 bg-green-muted border border-green-DEFAULT/20 rounded-full px-3 py-1 text-[11px] text-green-DEFAULT font-mono">
          <div className="w-1.5 h-1.5 rounded-full bg-green-DEFAULT" />
          {plan === "free" ? "free plan" : "pro plan"}
        </div>
      </div>
      <p className="text-sm text-muted">
        {remaining !== null
          ? `You have ${remaining} session${remaining !== 1 ? "s" : ""} left this week. Keep practicing.`
          : "You have unlimited sessions. Keep practicing."}
      </p>
    </div>
  );
}