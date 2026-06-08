import { useEffect, useRef, useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth0 } from "@auth0/auth0-react";
import AvatarPlayer from "../components/interview/AvatarPlayer";
import AudioRecorder from "../components/interview/AudioRecorder";
import Timer from "../components/interview/Timer";
import MotionDetector from "../components/interview/MotionDetector";
import PermissionCheck from "../components/interview/PermissionCheck";
import CamFeed from "../components/interview/CamFeed";
import * as api from "../services/api";
import {
  setPhase,
  setCurrentQuestion,
  setCurrentQuestionText,
  setRecording,
  resetInterview,
} from "../store/slices/interviewSlice";
import { resetMotion, setMonitoring } from "../store/slices/motionSlice";
import { clearSession } from "../store/slices/sessionSlice";

const getAudioExtension = (mimeType = "") => {
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("mpeg")) return "mp3";
  if (mimeType.includes("wav")) return "wav";
  return "webm";
};

export default function InterviewRoom() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getAccessTokenSilently } = useAuth0();

  const session = useSelector((s) => s.session);
  const interview = useSelector((s) => s.interview);
  const motion = useSelector((s) => s.motion);

  const webcamRef = useRef(null);
  const recorderRef = useRef(null);
  const isMountedRef = useRef(true);
  const hasInitializedRef = useRef(false);
  const isEndingRef = useRef(false);

  // ── GATEKEEPER STATE ────────────────────────────────────────────────
  const [hasPermissions, setHasPermissions] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Preparing your session...");

  const getToken = useCallback(
    () => getAccessTokenSilently(),
    [getAccessTokenSilently],
  );

  const getQuestionText = useCallback(
    (index) => {
      if (!session.questions?.length) return null;
      const q = session.questions[index];
      if (!q) return null;
      return q.question || q.questionText || null;
    },
    [session.questions],
  );

  // ── MOUNT LIFECYCLE ──────────────────────────────────────────────────
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      window.speechSynthesis?.cancel();
    };
  }, []);

  // ── 1. END SESSION ───────────────────────────────────────────────────
  const endSession = useCallback(
    async (token) => {
      if (isEndingRef.current) return;
      isEndingRef.current = true;
      dispatch(setPhase("SESSION_ENDING"));
      setStatusMsg("Wrapping up your session...");
      dispatch(setMonitoring(false));
      window.speechSynthesis?.cancel();

      try {
        await api.endSession(token, sessionId, {
          lookAwayCount: motion.lookAwayCount,
          phoneDetectedCount: motion.phoneDetectedCount,
          multiplePersonCount: motion.multiplePersonCount,
          integrityScore: motion.integrityScore,
        });

        setStatusMsg("Transcribing your answers...");
        const transcription = await api.transcribeSession(token, sessionId);
        const completedTranscripts =
          transcription.results?.filter(
            (result) => result.status === "completed",
          ).length || 0;

        if (completedTranscripts === 0) {
          throw new Error(
            "None of the recorded answers could be transcribed. Please retake the session.",
          );
        }

        setStatusMsg("Evaluating your performance...");
        await api.evaluateSession(token, sessionId);

        setStatusMsg("Generating your report...");
        await api.generateReport(token, sessionId);

        dispatch(setPhase("COMPLETED"));
        dispatch(clearSession());
        dispatch(resetInterview());

        navigate(`/report/${sessionId}`);
      } catch (err) {
        console.error("End session error:", err);
        isEndingRef.current = false;
        dispatch(setPhase("READY"));
        setStatusMsg(err.message || "Could not finish the session.");
      }
    },
    [motion, sessionId, navigate, dispatch],
  );

  // ── 2. LOAD QUESTION ─────────────────────────────────────────────────
  const loadQuestion = useCallback(
    async (index, token) => {
      if (!isMountedRef.current) return;

      const question = session.questions?.[index];
      if (!question) {
        console.error("Question not found at index", index);
        dispatch(setPhase("RECORDING"));
        return;
      }

      const questionText = getQuestionText(index) || "";

      dispatch(setPhase("AVATAR_SPEAKING"));
      dispatch(
        setCurrentQuestion({
          question,
          index,
          timeLimit: question.timeLimit || 120,
        }),
      );
      dispatch(setCurrentQuestionText(questionText));
      setStatusMsg("AI is asking the question...");

      try {
        await api.updateCurrentQuestion(token, sessionId, index);
      } catch (err) {
        console.error("updateCurrentQuestion error:", err.message);
      }
    },
    [session.questions, sessionId, getQuestionText, dispatch],
  );

  // ── 3. NEXT QUESTION OR END ──────────────────────────────────────────
  const goToNextQuestion = useCallback(
    async (currentIndex, token) => {
      const nextIndex = currentIndex + 1;
      const totalQuestions = session.questions?.length || 10;

      if (nextIndex >= totalQuestions) {
        await endSession(token);
      } else {
        await loadQuestion(nextIndex, token);
      }
    },
    [session.questions, endSession, loadQuestion],
  );

  // ── 4. FOLLOW UP ─────────────────────────────────────────────────────
  const handleFollowUp = useCallback(
    async (index, question, token) => {
      if (!isMountedRef.current) return;

      const followUpText = question.followUps?.[0];
      if (!followUpText) {
        await goToNextQuestion(index, token);
        return;
      }

      dispatch(setPhase("FOLLOW_UP"));
      dispatch(setCurrentQuestionText(followUpText));
      setStatusMsg("Follow-up question...");
    },
    [dispatch, goToNextQuestion],
  );

  // ── 5. STOP + UPLOAD + NEXT ──────────────────────────────────────────
  const stopAndUpload = useCallback(
    async (skipped = false) => {
      if (!isMountedRef.current) return;

      dispatch(setPhase("UPLOADING"));
      dispatch(setRecording(false));
      setStatusMsg("Saving your answer...");

      const token = await getToken();
      const currentIndex = interview.currentQuestionIndex;
      const question = session.questions?.[currentIndex];

      if (!question) return;

      try {
        const blob = await recorderRef.current?.stop();
        const duration = recorderRef.current?.getDuration() || 0;

        if (blob && blob.size > 1024) {
          const extension = getAudioExtension(blob.type);
          const formData = new FormData();
          formData.append(
            "audio",
            blob,
            `answer_q${currentIndex + 1}.${extension}`,
          );
          formData.append("sessionId", sessionId);
          formData.append("questionId", question._id || question.questionId);
          formData.append("questionOrder", String(currentIndex + 1));
          formData.append("questionText", getQuestionText(currentIndex) || "");
          formData.append("category", question.category || "role_specific");
          formData.append("answerDuration", String(duration));

          await api.uploadAudio(token, formData);
        }

        const needsFollowUp =
          !skipped && duration < 60 && question.followUps?.length > 0;

        await api.markQuestionAnswered(token, sessionId, {
          questionIndex: currentIndex,
          followUpAsked: needsFollowUp,
          followUpText: needsFollowUp ? question.followUps[0] : null,
        });

        if (needsFollowUp && isMountedRef.current) {
          await handleFollowUp(currentIndex, question, token);
        } else {
          await goToNextQuestion(currentIndex, token);
        }
      } catch (err) {
        console.error("Upload error:", err);
        await goToNextQuestion(currentIndex, token);
      }
    },
    [
      interview.currentQuestionIndex,
      session.questions,
      sessionId,
      getQuestionText,
      getToken,
      goToNextQuestion,
      handleFollowUp,
      dispatch,
    ],
  );

  // ── 6. START RECORDING ───────────────────────────────────────────────
  const startRecording = useCallback(
    async (index, token, timeLimit) => {
      if (!isMountedRef.current) return;
      dispatch(setPhase("RECORDING"));
      dispatch(setRecording(true));
      setStatusMsg("Your turn — speak your answer clearly.");

      const started = await recorderRef.current?.start();
      if (!started) {
        console.error("Mic recording failed to start");
      }
    },
    [dispatch],
  );

  // ── 7. AVATAR DONE SPEAKING → START RECORDING ───────────────────────
  const handleSpeakingEnd = useCallback(async () => {
    if (!isMountedRef.current) return;
    const token = await getToken();
    const currentIndex = interview.currentQuestionIndex;
    const timeLimit = session.questions?.[currentIndex]?.timeLimit || 120;
    await startRecording(currentIndex, token, timeLimit);
  }, [
    interview.currentQuestionIndex,
    session.questions,
    getToken,
    startRecording,
  ]);

  // ── 8. TIME UP / SKIP ────────────────────────────────────────────────
  const handleTimeUp = useCallback(async () => {
    await stopAndUpload(false);
  }, [stopAndUpload]);

  const handleSkip = useCallback(async () => {
    await stopAndUpload(true);
  }, [stopAndUpload]);

  // ── 9. POST-PERMISSION INITIALIZATION ────────────────────────────────
  // Fires exclusively after hardware permissions are verified and clicked
  const handlePermissionsCleared = async () => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    setHasPermissions(true);

    dispatch(resetInterview());
    dispatch(resetMotion());

    try {
      setStatusMsg("Starting your session...");
      const token = await getToken();

      await api.startSession(token, sessionId);
      dispatch(setMonitoring(true));

      if (!session.questions?.length) {
        setStatusMsg("No questions found. Please go back and try again.");
        return;
      }

      await loadQuestion(0, token);
    } catch (err) {
      console.error("Session init error:", err);
      setStatusMsg(`Error: ${err.message}`);
    }
  };

  // ── DERIVED STATE ────────────────────────────────────────────────────
  const totalQ = session.questions?.length || 10;
  const currentIdx = interview.currentQuestionIndex;
  const phase = interview.phase;
  const isRecording = phase === "RECORDING";
  const isAvatarSpeaking = phase === "AVATAR_SPEAKING" || phase === "FOLLOW_UP";

  // 🚨 GATEKEEPER BLOCK: Render permission utility before anything else
  if (!hasPermissions) {
    return <PermissionCheck onComplete={handlePermissionsCleared} />;
  }

  // ── LOADING SYSTEM OVERLAYS ──────────────────────────────────────────
  if (
    phase === "PREPARING" ||
    phase === "SESSION_ENDING" ||
    phase === "COMPLETED"
  ) {
    return (
      <div className="min-h-screen bg-[#090e0c] flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-[#4ade80]/20 border-t-[#4ade80] rounded-full animate-spin" />
        <p className="text-sm font-mono text-[#8a9e8e]">{statusMsg}</p>
      </div>
    );
  }

  // ── CORE ROOM PRESENTATION LAYER ─────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#090e0c] text-[#f8faf8] font-sans flex flex-col">
      <MotionDetector webcamRef={webcamRef} isActive={motion.isMonitoring} />

      {/* NAV */}
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
          <span className="text-sm font-semibold">PrepAI</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#8a9e8e] mr-1">
            Q {currentIdx + 1} / {totalQ}
          </span>
          <div className="flex gap-1">
            {Array(totalQ)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{
                    background:
                      i <= currentIdx ? "#4ade80" : "rgba(255,255,255,0.1)",
                    boxShadow:
                      i === currentIdx
                        ? "0 0 0 2px rgba(74,222,128,0.2)"
                        : "none",
                  }}
                />
              ))}
          </div>
        </div>

        <div className="text-[11px] font-mono text-[#4ade80] bg-[#4ade80]/5 border border-[#4ade80]/20 rounded-full px-3 py-1">
          {isAvatarSpeaking
            ? "AI speaking"
            : isRecording
              ? "recording"
              : "processing..."}
        </div>
      </nav>

      {/* ROOM SPLIT VIEW */}
      <div className="flex flex-1" style={{ height: "calc(100vh - 53px)" }}>
        {/* LEFT PANEL */}
        <div className="w-[350px] border-r border-white/6 flex flex-col items-center px-6 py-6 gap-6 shrink-0">
          <AvatarPlayer
            text={interview.currentQuestionText}
            onSpeakingEnd={handleSpeakingEnd}
          />
          <CamFeed ref={webcamRef} isRecording={isRecording} />
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex flex-col px-10 py-8 gap-6">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#4ade80] bg-[#4ade80]/10 rounded px-2.5 py-1 uppercase tracking-wider">
              {interview.currentQuestion?.category?.replace(/_/g, " ") ||
                "question"}
            </span>
            <span className="text-[11px] font-mono text-[#4a5e4e]">
              Question {currentIdx + 1} of {totalQ}
            </span>
          </div>

          <p className="text-[17px] text-[#f8faf8] leading-relaxed font-medium flex-1">
            {getQuestionText(currentIdx) || "Loading question..."}
          </p>

          <Timer
            duration={interview.currentQuestion?.timeLimit || 120}
            isRunning={isRecording}
            onTimeUp={handleTimeUp}
          />

          <AudioRecorder ref={recorderRef} isRecording={isRecording} />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-mono text-[#4a5e4e]">
              {isAvatarSpeaking
                ? "listen carefully to the question"
                : isRecording
                  ? "recording · speak clearly into your mic"
                  : "processing..."}
            </span>
            {isRecording && (
              <button
                onClick={handleSkip}
                className="text-[11px] text-[#8a9e8e] bg-transparent border border-white/10 rounded-lg px-3 py-1.5 hover:border-white/20 transition-colors cursor-pointer"
              >
                Next Question →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
