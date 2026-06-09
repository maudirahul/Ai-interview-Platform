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

  // State machine tracking to count events only on discrete start transitions
  const isLookingAwayRef = useRef(false);
  const isPhoneDetectedRef = useRef(false);
  const isMultiplePersonRef = useRef(false);

  useEffect(() => {
    if (!isActive) return;

    // Reset local refs on monitoring active start to ensure a fresh session
    countsRef.current = {
      lookAwayCount: 0,
      phoneDetectedCount: 0,
      multiplePersonCount: 0,
      integrityScore: 100,
    };
    violationBuffersRef.current = {
      lookAwayFrames: 0,
      phoneFrames: 0,
      multiplePersonFrames: 0,
    };
    isLookingAwayRef.current = false;
    isPhoneDetectedRef.current = false;
    isMultiplePersonRef.current = false;

    const loadDetector = async () => {
      try {
        // Cache optimization check: Reuse models if already loaded
        if (detectorRef.current && cocoRef.current) {
          console.log(
            "✅ [NextRound AI Engine]: Re-using cached models.",
          );
          startDetection();
          return;
        }

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
          violationBuffersRef.current.multiplePersonFrames = Math.min(
            3,
            violationBuffersRef.current.multiplePersonFrames + 1
          );

          if (violationBuffersRef.current.multiplePersonFrames >= 3) {
            if (!isMultiplePersonRef.current) {
              isMultiplePersonRef.current = true;
              countsRef.current.multiplePersonCount += 1;
              countsRef.current.integrityScore = Math.max(
                0,
                countsRef.current.integrityScore - 15,
              );
              stateChanged = true;
              console.warn("🚨 [VIOLATION COMMIT]: Multiple persons confirmed!");
            }
          }
        } else {
          violationBuffersRef.current.multiplePersonFrames = Math.max(
            0,
            violationBuffersRef.current.multiplePersonFrames - 1,
          );
          if (violationBuffersRef.current.multiplePersonFrames === 0) {
            if (isMultiplePersonRef.current) {
              isMultiplePersonRef.current = false;
              console.log("ℹ️ [VIOLATION END]: Multiple persons cleared.");
            }
          }
        }

        // Rule 2 & 3: Look Away (Hard Screen Loss & Soft Gaze Divergence)
        let isCurrentlyLookingAway = false;
        let lookAwayThreshold = 5;

        if (faces.length === 0) {
          isCurrentlyLookingAway = true;
          lookAwayThreshold = 4;
        } else if (faces.length === 1) {
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

            // 🎯 loosened look-away sensitivity multiplier is 0.88
            if (deviation > eyeWidth * 0.88) {
              isCurrentlyLookingAway = true;
              lookAwayThreshold = 5;
            }
          }
        }

        if (isCurrentlyLookingAway) {
          violationBuffersRef.current.lookAwayFrames = Math.min(
            lookAwayThreshold,
            violationBuffersRef.current.lookAwayFrames + 1
          );

          if (violationBuffersRef.current.lookAwayFrames >= lookAwayThreshold) {
            if (!isLookingAwayRef.current) {
              isLookingAwayRef.current = true;
              countsRef.current.lookAwayCount += 1;
              countsRef.current.integrityScore = Math.max(
                0,
                countsRef.current.integrityScore - 5,
              );
              stateChanged = true;
              console.warn(
                "🚨 [VIOLATION COMMIT]: Candidate look away detected!",
              );
            }
          }
        } else {
          if (faces.length === 1) {
            violationBuffersRef.current.lookAwayFrames = Math.max(
              0,
              violationBuffersRef.current.lookAwayFrames - 1,
            );
            if (violationBuffersRef.current.lookAwayFrames === 0) {
              if (isLookingAwayRef.current) {
                isLookingAwayRef.current = false;
                console.log("ℹ️ [VIOLATION END]: Candidate looking back at screen.");
              }
            }
          }
        }

        // ── TRACKING STEP B: CELL PHONE OBJECTS ───────────────────────
        if (cocoRef.current) {
          const objects = await cocoRef.current.detect(video);

          // Extended array classes catch phones sideways or resting near ears
          const prohibitedDeviceClasses = ["cell phone", "remote", "book"];
          const phoneInFrame = objects.some((obj) =>
            prohibitedDeviceClasses.includes(obj.class),
          );

          if (phoneInFrame) {
            violationBuffersRef.current.phoneFrames = Math.min(
              2,
              violationBuffersRef.current.phoneFrames + 1
            );

            if (violationBuffersRef.current.phoneFrames >= 2) {
              if (!isPhoneDetectedRef.current) {
                isPhoneDetectedRef.current = true;
                countsRef.current.phoneDetectedCount += 1;
                countsRef.current.integrityScore = Math.max(
                  0,
                  countsRef.current.integrityScore - 20,
                );
                stateChanged = true;
                console.error(
                  "🚨 [CRITICAL VIOLATION COMMIT]: Smart Device Confirmed inside stream!",
                );
              }
            }
          } else {
            violationBuffersRef.current.phoneFrames = Math.max(
              0,
              violationBuffersRef.current.phoneFrames - 1,
            );
            if (violationBuffersRef.current.phoneFrames === 0) {
              if (isPhoneDetectedRef.current) {
                isPhoneDetectedRef.current = false;
                console.log("ℹ️ [VIOLATION END]: Prohibited device removed.");
              }
            }
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
