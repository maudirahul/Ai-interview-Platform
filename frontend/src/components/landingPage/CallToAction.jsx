import { useAuth0 } from "@auth0/auth0-react";

export default function CallToAction() {
  const { loginWithRedirect } = useAuth0();

  return (
    <section className="py-10 px-10 text-center bg-[#0e1510] relative z-10 border-t border-white/5">
      <h2 className="text-[36px] font-bold tracking-[-1.2px] mb-4">Ready to practice?</h2>
      <p className="text-[15px] text-[#8a9e8e] mb-8">Free to start. No credit card. Just you and the AI interviewer.</p>
      <div className="flex gap-4 justify-center">
        <button 
          className="bg-green-400 text-[#0a0f0d] text-[14px] font-semibold rounded-[10px] px-7 py-3 hover:bg-green-300 transition-colors"
          onClick={() => loginWithRedirect({ screen_hint: "signup" })}
        >
          Start your first session
        </button>
        <button 
          className="bg-transparent border border-white/10 text-[#f8faf8] text-[14px] rounded-[10px] px-6 py-3 hover:bg-white/5 transition-colors"
          onClick={() => loginWithRedirect()}
        >
          Log in
        </button>
      </div>
    </section>
  );
}