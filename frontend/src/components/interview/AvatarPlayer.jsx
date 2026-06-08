import { useEffect, useRef, useState } from "react";

function InterviewerAvatar({ isSpeaking }) {
  const idleVideoRef = useRef(null);
  const talkingVideoRef = useRef(null);

  useEffect(() => {
    // Ensure both videos are pre-playing and ready to loop silently
    if (idleVideoRef.current) idleVideoRef.current.play().catch(() => {});
    if (talkingVideoRef.current) talkingVideoRef.current.play().catch(() => {});
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl bg-[#0d1511]">
      {/* Idle Video (Blinking / Smiling loop) */}
      <video
        ref={idleVideoRef}
        src="/models/female-idle.gif.mp4"
        autoPlay
        loop
        muted
        playsInline
        className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300 z-10 ${
          isSpeaking ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      />

      {/* Talking Video (Speaking loop) */}
      <video
        ref={talkingVideoRef}
        src="/models/female-talking.gif.mp4"
        autoPlay
        loop
        muted
        playsInline
        className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300 z-10 ${
          isSpeaking ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Lighting shadow gradient overlay for premium depth */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/45 via-transparent to-black/10 z-20" />
      <div className="absolute inset-x-0 bottom-0 h-8 pointer-events-none bg-gradient-to-t from-[#07100b] to-transparent z-20" />

      {/* Glowing EQ Waveform overlay during speech */}
      {isSpeaking && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-end gap-1 rounded-full border border-white/10 bg-black/35 px-3 py-2 backdrop-blur-md z-30">
          {[74, 36, 62, 86, 46, 68].map((height, index) => (
            <span
              key={`${height}-${index}`}
              className="w-1 rounded-full bg-[#4ade80]"
              style={{
                height: `${height / 5}px`,
                animation: "avatar-eq 620ms ease-in-out infinite",
                animationDelay: `${index * 90}ms`,
              }}
            />
          ))}
        </div>
      )}

      {/* LIVE status indicator */}
      <div className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/25 px-2 py-1 backdrop-blur-md z-30">
        <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${isSpeaking ? "bg-[#4ade80]" : "bg-white/35"}`} />
          <span className="text-[8px] font-mono uppercase tracking-wider text-white/75">
            Live
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AvatarPlayer({ text, playSignal = 0, onSpeakingEnd }) {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef(null);
  const onSpeakingEndRef = useRef(onSpeakingEnd);

  useEffect(() => {
    onSpeakingEndRef.current = onSpeakingEnd;
  }, [onSpeakingEnd]);

  useEffect(() => {
    if (!text || !hasInteracted) return undefined;

    let hasFinished = false;

    // Cancel any previous speech
    window.speechSynthesis?.cancel();
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Prioritize system-installed English female voices (Zira for Windows, Samantha/Karen for macOS, Google US English for Chrome)
    const femaleVoiceKeywords = ["zira", "samantha", "karen", "hazel", "victoria", "susan", "fiona", "female", "google us english", "microsoft zira mobile"];
    const voices = window.speechSynthesis?.getVoices?.() || [];
    const voice =
      voices.find((item) => {
        const nameLower = item.name?.toLowerCase() || "";
        return item.lang?.startsWith("en") && femaleVoiceKeywords.some(keyword => nameLower.includes(keyword));
      }) ||
      voices.find((item) => item.lang?.startsWith("en") && item.name?.includes("Google")) ||
      voices.find((item) => item.lang?.startsWith("en")) ||
      voices[0];

    if (voice) utterance.voice = voice;
    utterance.rate = 0.95;
    utterance.pitch = 1.02;

    // Poll the browser's speech engine every 100ms for robust state tracking
    const pollSpeaking = setInterval(() => {
      if (!window.speechSynthesis?.speaking && !hasFinished) {
        clearInterval(pollSpeaking);
        setIsSpeaking(false);
        onSpeakingEndRef.current?.();
      }
    }, 100);

    window.speechSynthesis?.speak(utterance);

    return () => {
      hasFinished = true;
      clearInterval(pollSpeaking);
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    };
  }, [text, playSignal, hasInteracted]);

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 bg-[#0d1511] border border-white/5 rounded-xl relative select-none overflow-hidden shrink-0 h-auto">
      {!hasInteracted ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950 rounded-xl z-40 p-2 text-center border border-white/5">
          <button
            onClick={() => setHasInteracted(true)}
            className="px-5 py-2.5 bg-[#4ade80] hover:bg-[#3bc772] text-[#090e0c] text-[10px] font-mono font-bold tracking-wider uppercase rounded-lg shadow-md cursor-pointer transition-all"
          >
            Connect AI
          </button>
        </div>
      ) : (
        <div className="w-full aspect-[4/3] relative z-10 rounded-xl overflow-hidden bg-black/10">
          <InterviewerAvatar isSpeaking={isSpeaking} />
        </div>
      )}

      <div className="flex items-center gap-2 mt-2.5 z-20">
        <span className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? "bg-[#4ade80] animate-pulse" : "bg-[#4a5e4e]"}`} />
        <span className="text-[9px] font-mono tracking-widest text-[#8a9e8e] uppercase">
          {isSpeaking ? "AI Talking" : "AI Idle"}
        </span>
      </div>
    </div>
  );
}
