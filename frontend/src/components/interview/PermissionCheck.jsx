import { useState, useEffect } from "react";

export default function PermissionCheck({ onComplete }) {
  const [micStatus, setMicStatus] = useState("waiting");
  const [camStatus, setCamStatus] = useState("waiting");
  const [audioStatus, setAudioStatus] = useState("waiting");

  // ── HARDWARE UTILITIES ─────────────────────────────────────────────
  const requestMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStatus("granted");
      setAudioStatus("granted");
      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      setMicStatus("blocked");
      setAudioStatus("blocked");
    }
  };

  const requestCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCamStatus("granted");
      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      setCamStatus("blocked");
    }
  };

  // Passive initial system check
  useEffect(() => {
    const probeDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasAudio = devices.some(
          (d) => d.kind === "audioinput" && d.label,
        );
        const hasVideo = devices.some(
          (d) => d.kind === "videoinput" && d.label,
        );

        if (hasAudio) {
          setMicStatus("granted");
          setAudioStatus("granted");
        }
        if (hasVideo) setCamStatus("granted");
      } catch (e) {
        // Fallback to active click-to-allow prompts
      }
    };
    probeDevices();
  }, []);

  const allPermissionsGranted =
    micStatus === "granted" &&
    camStatus === "granted" &&
    audioStatus === "granted";

  return (
    <div className="min-h-screen bg-[#090e0c] text-[#f8faf8] font-sans flex flex-col">
      {/* Mini Top Navbar */}
      <nav className="flex items-center justify-between px-7 py-3.5 border-b border-white/6 bg-[#090e0c]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#4ade80] rounded-md flex items-center justify-center">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="#090e0c"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1.5 6l2.5 2.5 6-6" />
            </svg>
          </div>
          <span className="text-sm font-semibold">NextRound</span>
        </div>
        <div className="text-xs font-mono text-[#8a9e8e]">
          MERN Stack · Fresher
        </div>
      </nav>

      {/* Main Content Card Container */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-xl mx-auto w-full text-center pb-12">
        <span className="text-[10px] font-mono tracking-[0.2em] text-[#4ade80] uppercase mb-3">
          Before we begin
        </span>
        <h1 className="text-3xl font-bold tracking-tight mb-3">
          Allow access to continue
        </h1>
        <p className="text-sm text-[#8a9e8e] max-w-md mb-8 leading-relaxed">
          The interview requires your microphone and camera. These are only used
          during your session and never stored.
        </p>

        {/* Device Rows Stack */}
        <div className="w-full flex flex-col gap-3.5 mb-8 text-left">
          {/* Microphone */}
          <div
            className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
              micStatus === "granted"
                ? "border-[#4ade80]/30 bg-[#4ade80]/5"
                : micStatus === "blocked"
                  ? "border-red-500/30 bg-red-500/5"
                  : "border-white/10 bg-white/2"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-lg">
                🎤
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-0.5">Microphone</h4>
                <p className="text-xs text-[#8a9e8e]">
                  To record your spoken answers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-mono flex items-center gap-1.5 ${
                  micStatus === "granted"
                    ? "text-[#4ade80]"
                    : micStatus === "blocked"
                      ? "text-red-400"
                      : "text-[#8a9e8e]"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${micStatus === "granted" ? "bg-[#4ade80]" : micStatus === "blocked" ? "bg-red-400" : "bg-neutral-500 animate-pulse"}`}
                />
                {micStatus}
              </span>
              {micStatus !== "granted" && (
                <button
                  onClick={requestMic}
                  className="text-xs font-medium px-4 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  {micStatus === "blocked" ? "Retry" : "Allow"}
                </button>
              )}
            </div>
          </div>

          {/* Camera */}
          <div
            className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
              camStatus === "granted"
                ? "border-[#4ade80]/30 bg-[#4ade80]/5"
                : camStatus === "blocked"
                  ? "border-red-500/30 bg-red-500/5"
                  : "border-white/10 bg-white/2"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-lg">
                📷
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-0.5">Camera</h4>
                <p className="text-xs text-[#8a9e8e]">
                  For presence and integrity monitoring
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-mono flex items-center gap-1.5 ${
                  camStatus === "granted"
                    ? "text-[#4ade80]"
                    : camStatus === "blocked"
                      ? "text-red-400"
                      : "text-[#8a9e8e]"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${camStatus === "granted" ? "bg-[#4ade80]" : camStatus === "blocked" ? "bg-red-400" : "bg-neutral-500 animate-pulse"}`}
                />
                {camStatus}
              </span>
              {camStatus !== "granted" && (
                <button
                  onClick={requestCam}
                  className="text-xs font-medium px-4 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  {camStatus === "blocked" ? "Retry" : "Allow"}
                </button>
              )}
            </div>
          </div>

          {/* Audio Output */}
          <div
            className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
              audioStatus === "granted"
                ? "border-[#4ade80]/30 bg-[#4ade80]/5"
                : audioStatus === "blocked"
                  ? "border-red-500/30 bg-red-500/5"
                  : "border-white/10 bg-white/2"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-lg">
                🔊
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-0.5">Audio Output</h4>
                <p className="text-xs text-[#8a9e8e]">
                  To hear the AI interviewer speak
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-mono flex items-center gap-1.5 ${
                  audioStatus === "granted"
                    ? "text-[#4ade80]"
                    : audioStatus === "blocked"
                      ? "text-red-400"
                      : "text-[#8a9e8e]"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${audioStatus === "granted" ? "bg-[#4ade80]" : audioStatus === "blocked" ? "bg-red-400" : "bg-neutral-500"}`}
                />
                {audioStatus}
              </span>
              {audioStatus !== "granted" && (
                <button
                  onClick={requestMic}
                  className="text-xs font-medium px-4 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Disclaimer Lists */}
        <div className="w-full flex flex-col gap-2.5 text-left mb-8 pl-1">
          <div className="flex items-start gap-2.5 text-xs text-[#8a9e8e]">
            <span className="text-[#4ade80] text-sm mt-0.5">✓</span>
            <p>
              Your camera and mic are never recorded or stored on our servers
            </p>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-[#8a9e8e]">
            <span className="text-[#4ade80] text-sm mt-0.5">✓</span>
            <p>Audio is only used for answer transcription</p>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-[#8a9e8e]">
            <span className="text-[#4ade80] text-sm mt-0.5">✓</span>
            <p>You can end the session at any time</p>
          </div>
        </div>

        {/* Action Dispatcher Button */}
        <button
          disabled={!allPermissionsGranted}
          onClick={onComplete}
          className={`w-full py-3.5 text-sm font-medium rounded-xl transition-all tracking-wide ${
            allPermissionsGranted
              ? "bg-[#4ade80] text-[#090e0c] shadow-lg shadow-[#4ade80]/10 cursor-pointer active:scale-[0.99]"
              : "bg-white/4 text-white/30 border border-white/5 cursor-not-allowed"
          }`}
        >
          {allPermissionsGranted
            ? "Start Your Interview Session →"
            : "Grant all permissions to continue"}
        </button>
      </div>
    </div>
  );
}
