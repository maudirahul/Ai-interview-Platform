import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { updateMotion } from "../../store/slices/motionSlice";

export default function MotionDetector({ webcamRef, isActive }) {
  const dispatch = useDispatch();
  const detectorRef = useRef(null);
  const cocoRef = useRef(null);
  const intervalRef = useRef(null);
  const isProcessingRef = useRef(false); // Locks thread to prevent async loop stack-ups

  // Frame buffers to require sustained violations before locking a strike
  const violationBuffersRef = useRef({
    lookAwayFrames: 0,
    phoneFrames: 0,
    multiplePersonFrames: 0,
  });

  const countsRef = useRef({
    lookAwayCount: 0,
    phoneDetectedCount: 0,
    multiplePersonCount: 0,
    integrityScore: 100,
  });

  useEffect(() => {
    if (!isActive) return;

    const loadDetector = async () => {
      try {
        // 1. Dynamic Load TensorFlow & Face Mesh Dependencies
        const vision =
          await import("@tensorflow-models/face-landmarks-detection");
        await import("@tensorflow/tfjs-backend-webgl");
        const tf = await import("@tensorflow/tfjs");
        await tf.setBackend("webgl");

        const faceDetector = await vision.createDetector(
          vision.SupportedModels.MediaPipeFaceMesh,
          {
            runtime: "tfjs",
            maxFaces: 3,
            refineLandmarks: false,
          },
        );
        detectorRef.current = faceDetector;

        // 2. Load COCO-SSD Model to enable true phone identification
        const cocoSSD = await import("@tensorflow-models/coco-ssd");
        const objectDetector = await cocoSSD.load();
        cocoRef.current = objectDetector;

        console.log(
          "✅ [NextRound AI Engine]: High-speed integrity engine active and listening.",
        );
        startDetection();
      } catch (err) {
        console.error("❌ [NextRound AI Engine] Initialization failure:", err);
      }
    };

    loadDetector();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  const startDetection = () => {
    // ⚡ SUB-SECOND CLOCK (300ms) for ultra-responsive tracking execution
    intervalRef.current = setInterval(async () => {
      if (!detectorRef.current || !webcamRef?.current) {
        return;
      }

      if (isProcessingRef.current) return; // Skip frame drop if calculation is running

      const video = webcamRef.current.video || webcamRef.current;
      if (!video || video.readyState !== 4) return;

      try {
        isProcessingRef.current = true;
        let stateChanged = false;

        // ── TRACKING STEP A: FACE STRUCTURES ───────────────────────────
        const faces = await detectorRef.current.estimateFaces(video);

        // Rule 1: Multiple Persons Detected
        if (faces.length > 1) {
          violationBuffersRef.current.multiplePersonFrames += 1;
          console.log(
            `⚠️ [Face Buffer]: Multiple faces spotted. Buffer: ${violationBuffersRef.current.multiplePersonFrames}/3`,
          );

          if (violationBuffersRef.current.multiplePersonFrames >= 3) {
            countsRef.current.multiplePersonCount += 1;
            countsRef.current.integrityScore = Math.max(
              0,
              countsRef.current.integrityScore - 15,
            );
            stateChanged = true;
            violationBuffersRef.current.multiplePersonFrames = 0; // Reset
            console.warn("🚨 [VIOLATION COMMIT]: Multiple persons confirmed!");
          }
        } else {
          violationBuffersRef.current.multiplePersonFrames = Math.max(
            0,
            violationBuffersRef.current.multiplePersonFrames - 1,
          );
        }

        // Rule 2: Hard Screen Loss (Left frame entirely)
        if (faces.length === 0) {
          violationBuffersRef.current.lookAwayFrames += 1;
          console.log(
            `⚠️ [Face Buffer]: No face in frame. Buffer: ${violationBuffersRef.current.lookAwayFrames}/4`,
          );

          if (violationBuffersRef.current.lookAwayFrames >= 4) {
            countsRef.current.lookAwayCount += 1;
            countsRef.current.integrityScore = Math.max(
              0,
              countsRef.current.integrityScore - 5,
            );
            stateChanged = true;
            violationBuffersRef.current.lookAwayFrames = 0; // Reset
            console.warn(
              "🚨 [VIOLATION COMMIT]: Candidate completely left camera frame!",
            );
          }
        }

        // Rule 3: Soft Gaze Divergence Leeway Adjustments
        if (faces.length === 1) {
          const keypoints = faces[0].keypoints;
          const nose =
            keypoints.find((k) => k.name === "noseTip") || keypoints[4];
          const leftEye =
            keypoints.find((k) => k.name === "leftEye") || keypoints[33];
          const rightEye =
            keypoints.find((k) => k.name === "rightEye") || keypoints[263];

          if (nose && leftEye && rightEye) {
            const eyeMidX = (leftEye.x + rightEye.x) / 2;
            const deviation = Math.abs(nose.x - eyeMidX);
            const eyeWidth = Math.abs(leftEye.x - rightEye.x);

            // 🎯 loosened look-away sensitivity multiplier from 0.6 to 0.88
            if (deviation > eyeWidth * 0.88) {
              violationBuffersRef.current.lookAwayFrames += 1;
              console.log(
                `⚠️ [Gaze Buffer]: Off-angle tracking active. Buffer: ${violationBuffersRef.current.lookAwayFrames}/5`,
              );

              if (violationBuffersRef.current.lookAwayFrames >= 5) {
                countsRef.current.lookAwayCount += 1;
                countsRef.current.integrityScore = Math.max(
                  0,
                  countsRef.current.integrityScore - 5,
                );
                stateChanged = true;
                violationBuffersRef.current.lookAwayFrames = 0; // Reset
                console.warn(
                  "🚨 [VIOLATION COMMIT]: Candidate looked completely off-screen!",
                );
              }
            } else {
              // Smoothly decay buffer step count if candidate looks back to frame center
              violationBuffersRef.current.lookAwayFrames = Math.max(
                0,
                violationBuffersRef.current.lookAwayFrames - 1,
              );
            }
          }
        }

        // ── TRACKING STEP B: CELL PHONE OBJECTS ───────────────────────
        if (cocoRef.current) {
          const objects = await cocoRef.current.detect(video);

          if (objects.length > 0) {
            console.log(
              "👁️ [AI Vision Scan Summary]:",
              objects.map((o) => `${o.class} (${Math.round(o.score * 100)}%)`),
            );
          }

          // Extended array classes catch phones sideways or resting near ears
          const prohibitedDeviceClasses = ["cell phone", "remote", "book"];
          const phoneInFrame = objects.some((obj) =>
            prohibitedDeviceClasses.includes(obj.class),
          );

          if (phoneInFrame) {
            violationBuffersRef.current.phoneFrames += 1;
            console.log(
              `⚠️ [Device Buffer]: Prohibited object in frame. Buffer: ${violationBuffersRef.current.phoneFrames}/2`,
            );

            if (violationBuffersRef.current.phoneFrames >= 2) {
              // Fires instantly (~600ms total latency)
              countsRef.current.phoneDetectedCount += 1;
              countsRef.current.integrityScore = Math.max(
                0,
                countsRef.current.integrityScore - 20,
              );
              stateChanged = true;
              violationBuffersRef.current.phoneFrames = 0; // Reset
              console.error(
                "🚨 [CRITICAL VIOLATION COMMIT]: Smart Device Confirmed inside stream!",
              );
            }
          } else {
            violationBuffersRef.current.phoneFrames = Math.max(
              0,
              violationBuffersRef.current.phoneFrames - 1,
            );
          }
        }

        // ── TRACKING STEP C: REDUX SYNC ────────────────────────────────
        if (stateChanged) {
          dispatch(updateMotion({ ...countsRef.current }));
        }
      } catch (err) {
        console.error("❌ [Frame Evaluation Error]:", err.message);
      } finally {
        isProcessingRef.current = false;
      }
    }, 300);
  };

  return null;
}
