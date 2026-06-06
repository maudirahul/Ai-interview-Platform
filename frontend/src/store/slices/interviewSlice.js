import { createSlice } from "@reduxjs/toolkit";

const interviewSlice = createSlice({
  name: "interview",
  initialState: {
    currentQuestionIndex: 0,
    currentQuestion: null,
    timeRemaining: 0,
    isAvatarSpeaking: false,
    isRecording: false,
    isFollowUpActive: false,
    avatarAudioUrl: null,
    transcriptIds: [],
    phase: "PREPARING", // PREPARING | READY | AVATAR_SPEAKING | RECORDING | UPLOADING | FOLLOW_UP | SESSION_ENDING | COMPLETED
  },
  reducers: {
    setPhase(state, action) {
      state.phase = action.payload;
    },
    setCurrentQuestion(state, action) {
      state.currentQuestion = action.payload.question;
      state.currentQuestionIndex = action.payload.index;
      state.timeRemaining = action.payload.timeLimit;
    },
    setAvatarSpeaking(state, action) {
      state.isAvatarSpeaking = action.payload;
    },
    setRecording(state, action) {
      state.isRecording = action.payload;
    },
    setFollowUp(state, action) {
      state.isFollowUpActive = action.payload;
    },
    setAvatarAudioUrl(state, action) {
      state.avatarAudioUrl = action.payload;
    },
    addTranscriptId(state, action) {
      state.transcriptIds.push(action.payload);
    },
    setCurrentQuestionText(state, action) {
      state.currentQuestionText = action.payload;
    },
    resetInterview() {
      return {
        currentQuestionIndex: 0,
        currentQuestion: null,
        timeRemaining: 0,
        isAvatarSpeaking: false,
        isRecording: false,
        isFollowUpActive: false,
        avatarAudioUrl: null,
        transcriptIds: [],
        phase: "PREPARING",
      };
    },
  },
});

export const {
  setPhase,
  setCurrentQuestion,
  setAvatarSpeaking,
  setRecording,
  setFollowUp,
  setAvatarAudioUrl,
  addTranscriptId,
  setCurrentQuestionText,
  resetInterview,
} = interviewSlice.actions;

export default interviewSlice.reducer;
