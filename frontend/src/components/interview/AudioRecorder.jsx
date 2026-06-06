import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";

const AudioRecorder = forwardRef(({ isRecording }, ref) => {
  const [bars, setBars] = useState(Array(28).fill(4));

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const animFrameRef = useRef(null);
  const startTimeRef = useRef(null);

  const getSupportedMimeType = () => {
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/mp4",
    ];

    return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
  };

  const cleanupRecordingResources = () => {
    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    analyserRef.current = null;

    const audioContext = audioContextRef.current;
    audioContextRef.current = null;

    if (audioContext && audioContext.state !== "closed") {
      audioContext.close().catch((err) => {
        if (err.name !== "InvalidStateError") {
          console.error("AudioContext close error:", err);
        }
      });
    }
  };

  useImperativeHandle(ref, () => ({
    start: async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        streamRef.current = stream;

        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();

        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();

        analyser.fftSize = 128;
        source.connect(analyser);

        analyserRef.current = analyser;

        const mimeType = getSupportedMimeType();
        const recorder = new MediaRecorder(
          stream,
          mimeType ? { mimeType } : undefined
        );

        console.log("Recorder MIME:", recorder.mimeType);

        mediaRecorderRef.current = recorder;
        chunksRef.current = [];
        startTimeRef.current = Date.now();

        recorder.ondataavailable = (event) => {
          console.log(
            "Chunk received:",
            event.data.size,
            event.data.type
          );

          if (event.data && event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        recorder.onerror = (error) => {
          console.error("Recorder Error:", error);
        };

        recorder.start();

        animateWaveform();

        return true;
      } catch (error) {
        console.error("Mic Error:", error);
        return false;
      }
    },

    stop: () => {
      return new Promise((resolve) => {
        const recorder = mediaRecorderRef.current;

        if (!recorder || recorder.state === "inactive") {
          resolve(null);
          return;
        }

        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, {
            type: recorder.mimeType || "audio/webm",
          });

          console.log("Chunks:", chunksRef.current.length);
          console.log("Blob Type:", blob.type);
          console.log("Blob Size:", blob.size);

          const totalBytes = chunksRef.current.reduce(
            (sum, chunk) => sum + chunk.size,
            0
          );

          console.log("Total Chunk Bytes:", totalBytes);

          mediaRecorderRef.current = null;
          cleanupRecordingResources();
          setBars(Array(28).fill(4));

          resolve(blob);
        };

        recorder.stop();
      });
    },

    getDuration: () => {
      if (!startTimeRef.current) return 0;

      return Math.round(
        (Date.now() - startTimeRef.current) / 1000
      );
    },
  }));

  const animateWaveform = () => {
    const analyser = analyserRef.current;

    if (!analyser) return;

    const data = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      analyser.getByteFrequencyData(data);

      const newBars = Array(28)
        .fill(0)
        .map((_, i) => {
          const idx = Math.floor((i / 28) * data.length);

          return Math.max(
            4,
            Math.round((data[idx] / 255) * 28)
          );
        });

      setBars(newBars);

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  useEffect(() => {
    return () => {
      cleanupRecordingResources();
    };
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-[#4a5e4e] uppercase tracking-widest">
          your answer
        </span>

        {isRecording && (
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-red-400">
            <div
              className="w-1.5 h-1.5 rounded-full bg-red-400"
              style={{
                animation:
                  "blink 1s ease-in-out infinite",
              }}
            />
            recording
          </div>
        )}
      </div>

      <div className="flex items-center gap-[2.5px] h-8">
        {bars.map((h, i) => (
          <div
            key={i}
            className="w-0.75 rounded-full bg-[#4ade80]"
            style={{
              height: `${h}px`,
              opacity: isRecording ? 0.75 : 0.2,
              transition: "height 0.08s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
});

AudioRecorder.displayName = "AudioRecorder";

export default AudioRecorder;
