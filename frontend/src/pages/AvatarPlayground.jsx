import { useState } from "react";
import AvatarPlayer from "../components/interview/AvatarPlayer"; // Sahi relative path check kar lena

export default function AvatarPlayground() {
  const [textToSpeak, setTextToSpeak] = useState("");
  const [currentText, setCurrentText] = useState("");
  const [playSignal, setPlaySignal] = useState(0);

  const handleSpeakClick = () => {
    // Jab button click hoga, tabhi text pass hoga aur avatar bolega
    setCurrentText(textToSpeak);
    setPlaySignal((value) => value + 1);
  };

  const handleSpeakingEnd = () => {
    console.log("Avatar ne bolna khatam kar diya!");
    setCurrentText(""); // Reset text after speaking
  };

  const loadPresetText = (preset) => {
    setTextToSpeak(preset);
  };

  // Quick testing questions
  const presets = [
    "Hello there! Welcome to PrepAI. I am your Indian HR interviewer today. Tell me about yourself.",
    "Great. Can you explain the difference between local storage, session storage, and cookies in JavaScript?",
    "Thank you for your response. What are your salary expectations for this role?"
  ];

  return (
    <div className="min-h-screen bg-[#090e0c] text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-neutral-900/40 p-6 rounded-2xl border border-white/5 flex flex-col gap-5 shadow-2xl backdrop-blur-md">
        
        <div className="text-center border-b border-white/5 pb-3">
          <h2 className="text-sm font-mono text-[#4ade80] tracking-wider uppercase font-bold">
            ⚡ AI Avatar Test Bench ⚡
          </h2>
          <p className="text-[10px] text-neutral-500 font-mono mt-1">
            Route: /test-avatar
          </p>
        </div>

        {/* 1. Aapka 3D Avatar Component */}
        <div className="bg-black/20 rounded-xl p-2 border border-white/[0.02]">
          <AvatarPlayer 
            text={currentText} 
            playSignal={playSignal}
            onSpeakingEnd={handleSpeakingEnd} 
          />
        </div>

        {/* 2. Quick Preset Buttons */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
            Quick Test Questions:
          </label>
          <div className="flex flex-col gap-1">
            {presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => loadPresetText(preset)}
                className="w-full text-left p-2 bg-neutral-950 hover:bg-neutral-800 border border-white/5 rounded-lg text-[11px] text-neutral-300 transition-colors truncate"
              >
                Q{index + 1}: {preset}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Custom Text Input Box */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
            Type Custom Dialogue:
          </label>
          <textarea
            value={textToSpeak}
            onChange={(e) => setTextToSpeak(e.target.value)}
            placeholder="Type anything here for the avatar to speak..."
            className="w-full h-20 p-3 bg-neutral-950 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#4ade80]/40 resize-none font-mono"
          />
        </div>

        {/* 4. Trigger Button */}
        <button
          onClick={handleSpeakClick}
          disabled={!textToSpeak}
          className="w-full py-3 bg-[#4ade80] hover:bg-[#3bc772] disabled:bg-neutral-800 disabled:text-neutral-600 text-[#090e0c] text-xs font-mono font-bold tracking-wider uppercase rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-[#4ade80]/5"
        >
          Test Speak →
        </button>

      </div>
    </div>
  );
}
