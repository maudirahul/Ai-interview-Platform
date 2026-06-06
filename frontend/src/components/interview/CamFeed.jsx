import { forwardRef } from "react";
import Webcam from "react-webcam";

const CamFeed = forwardRef(({ isRecording }, ref) => {
  return (
    <div className="w-full flex-1 relative rounded-xl overflow-hidden border border-white/6 bg-[#162019] min-h-45">
      <Webcam
        ref={ref}
        audio={false}
        mirrored
        className="w-full h-full object-cover"
        videoConstraints={{ facingMode: "user" }}
        onUserMediaError={(err) => console.error("Webcam error:", err)}
      />

      {/* REC badge */}
      {isRecording && (
        <div className="absolute top-2 left-2 flex items-center gap-1.5 text-[10px] font-mono text-red-400 bg-red-400/10 border border-red-400/20 rounded px-2 py-0.5">
          <div
            className="w-1.5 h-1.5 rounded-full bg-red-400"
            style={{ animation: "blink 1s ease-in-out infinite" }}
          />
          REC
          <style>{`
            @keyframes blink {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.2; }
            }
          `}</style>
        </div>
      )}

      {/* Corner label */}
      <div className="absolute bottom-2 right-2 text-[10px] font-mono text-[#4a5e4e]">
        you
      </div>
    </div>
  );
});

CamFeed.displayName = "CamFeed";
export default CamFeed;
