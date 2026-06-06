import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import MotionDetector from "../components/interview/MotionDetector";
import { resetMotion } from "../store/slices/motionSlice";

export default function MotionTestPage() {
  const dispatch = useDispatch();
  const videoRef = useRef(null);
  const [streamActive, setStreamActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [tick, setTick] = useState(false); // Used to visually show the 300ms engine cycle

  // Read the active integrity variables straight from your Redux store
  const motionMetrics = useSelector((state) => state.motion);

  // Synchronize a visual pulse widget to match the 300ms backend processing thread
  useEffect(() => {
    if (!streamActive) return;
    const pulseInterval = setInterval(() => {
      setTick((prev) => !prev);
    }, 300);
    return () => clearInterval(pulseInterval);
  }, [streamActive]);

  // Launch local webcam hardware access
  useEffect(() => {
    dispatch(resetMotion()); // Clear out old tallies from prior runs

    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: false,
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStreamActive(true);
        }
      } catch (err) {
        console.error("Local camera acquisition failed:", err);
        setErrorMsg("Failed to connect to webcam hardware. Ensure permissions are granted.");
      }
    }

    setupCamera();

    return () => {
      // Clean up camera hardware tracks when leaving the test screen
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-[#090e0c] text-[#f8faf8] font-sans p-8 flex flex-col gap-6 select-none">
      
      {/* Test Page Header */}
      <header className="border-b border-white/[0.06] pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            AI Vision Playground
            {streamActive && (
              <span className="text-[10px] font-mono bg-[#4ade80]/10 text-[#4ade80] px-2 py-0.5 rounded-full border border-[#4ade80]/20 flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                LIVE PIPELINE
              </span>
            )}
          </h1>
          <p className="text-xs text-[#8a9e8e] mt-1">
            Test real-time model metrics, tracking speeds, and leeway thresholds instantly.
          </p>
        </div>
        <button 
          onClick={() => dispatch(resetMotion())}
          className="text-xs font-mono bg-white/5 border border-white/10 text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer active:scale-95"
        >
          Reset Metrics
        </button>
      </header>

      {/* Main Sandbox Grid Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 items-start">
        
        {/* Left Aspect: Live Camera Monitor Render Frame */}
        <div className="md:col-span-2 bg-white/[0.01] border border-white/[0.05] rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden aspect-video justify-center items-center bg-neutral-950 shadow-2xl">
          {errorMsg ? (
            <p className="text-sm text-red-400 font-mono bg-red-500/5 border border-red-500/10 p-4 rounded-xl">{errorMsg}</p>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-xl border border-white/5 scale-x-[-1]" // Mirror effect
            />
          )}

          {/* Mount the active engine instance safely */}
          {streamActive && (
            <MotionDetector webcamRef={videoRef} isActive={true} />
          )}
        </div>

        {/* Right Aspect: Real-Time Metric Telemetry Readout */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#8a9e8e]">Real-Time Telemetry</h3>
            {streamActive && (
              <span className="text-[10px] font-mono text-[#8a9e8e] flex items-center gap-1.5">
                Engine Pulse: 
                <span className={`w-2 h-2 rounded-full transition-colors duration-75 ${tick ? "bg-[#4ade80]" : "bg-neutral-700"}`} />
                300ms
              </span>
            )}
          </div>

          {/* Integrity Score Big Counter Card */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
            <span className="text-xs font-mono text-[#8a9e8e] block mb-1">Integrity Score</span>
            <span className={`text-5xl font-bold font-mono tracking-tighter transition-colors duration-200 ${
              motionMetrics.integrityScore > 75 ? "text-[#4ade80]" : motionMetrics.integrityScore > 40 ? "text-amber-400" : "text-red-400"
            }`}>
              {motionMetrics.integrityScore}%
            </span>
          </div>

          {/* Individual Violation Tracker Sub-cards */}
          <div className="flex flex-col gap-2">
            
            {/* Phone Detection Tracker */}
            <div className={`flex justify-between items-center border rounded-xl p-4 transition-all duration-200 ${
              motionMetrics.phoneDetectedCount > 0 ? "border-red-500/30 bg-red-500/[0.02]" : "border-white/[0.05] bg-white/[0.01]"
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-lg">📱</span>
                <div>
                  <h5 className="text-sm font-medium">Prohibited Devices</h5>
                  <p className="text-[11px] text-[#8a9e8e]">Instant check (~600ms latency)</p>
                </div>
              </div>
              <span className={`font-mono text-sm font-bold px-2.5 py-0.5 rounded ${
                motionMetrics.phoneDetectedCount > 0 ? "bg-red-500/10 text-red-400" : "text-[#8a9e8e] bg-white/5"
              }`}>
                {motionMetrics.phoneDetectedCount}
              </span>
            </div>

            {/* Look Away Detection Tracker */}
            <div className={`flex justify-between items-center border rounded-xl p-4 transition-all duration-200 ${
              motionMetrics.lookAwayCount > 0 ? "border-amber-500/30 bg-amber-500/[0.02]" : "border-white/[0.05] bg-white/[0.01]"
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-lg">👀</span>
                <div>
                  <h5 className="text-sm font-medium">Gaze Divergence</h5>
                  <p className="text-[11px] text-[#8a9e8e]">Loosened threshold (0.88 grid)</p>
                </div>
              </div>
              <span className={`font-mono text-sm font-bold px-2.5 py-0.5 rounded ${
                motionMetrics.lookAwayCount > 0 ? "bg-amber-500/10 text-amber-400" : "text-[#8a9e8e] bg-white/5"
              }`}>
                {motionMetrics.lookAwayCount}
              </span>
            </div>

            {/* Multiple Person Tracker */}
            <div className={`flex justify-between items-center border rounded-xl p-4 transition-all duration-200 ${
              motionMetrics.multiplePersonCount > 0 ? "border-red-500/30 bg-red-500/[0.02]" : "border-white/[0.05] bg-white/[0.01]"
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-lg">👥</span>
                <div>
                  <h5 className="text-sm font-medium">Multiple Persons</h5>
                  <p className="text-[11px] text-[#8a9e8e]">Secondary face monitoring</p>
                </div>
              </div>
              <span className={`font-mono text-sm font-bold px-2.5 py-0.5 rounded ${
                motionMetrics.multiplePersonCount > 0 ? "bg-red-500/10 text-red-400" : "text-[#8a9e8e] bg-white/5"
              }`}>
                {motionMetrics.multiplePersonCount}
              </span>
            </div>

          </div>

          <blockquote className="bg-white/[0.02] border-l-2 border-[#4ade80]/30 p-3 rounded-r-xl text-[11px] text-[#8a9e8e] leading-relaxed font-mono">
            💡 The tracking loop is running every 300ms. Open the browser inspector console (F12) to see raw bounding calculations and frame buffer arrays.
          </blockquote>
        </div>

      </div>
    </div>
  );
}