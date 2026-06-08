import Navbar from "../components/landingPage/Navbar";
import Hero from "../components/landingPage/Hero";
import HowItWorks from "../components/landingPage/HowItWorks";
import Roles from "../components/landingPage/Roles";
import ReportPreview from "../components/landingPage/ReportPreview";
import CallToAction from "../components/landingPage/CallToAction";
import Footer from "../components/landingPage/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0f0d] text-[#f8faf8] font-sans relative overflow-x-hidden">
      {/* NOISE OVERLAY */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        }}
      />

      <Navbar />

      <Hero />
      
      <hr className="border-none border-t border-white/5 w-full max-w-[1200px] mx-auto relative z-10" />

      <HowItWorks />
      
      <hr className="border-none border-t border-white/5 w-full max-w-[1200px] mx-auto relative z-10" />

      <Roles />
      
      <hr className="border-none border-t border-white/5 w-full max-w-[1200px] mx-auto relative z-10" />

      <ReportPreview />

      <CallToAction />
      <Footer />
    </div>
  );
}
