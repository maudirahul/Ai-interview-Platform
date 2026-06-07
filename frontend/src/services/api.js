const BASE_URL = import.meta.env.VITE_API_URL;

async function request(endpoint, token, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ── USER ───────────────────────────────────────────────
export const getMe = (token) =>
  request("/users/me", token);

export const updateMe = (token, body) =>
  request("/users/me", token, { method: "PUT", body: JSON.stringify(body) });

// ── QUESTIONS ──────────────────────────────────────────
export const getRoles = (token) =>
  request("/questions/roles", token);

export const prepareQuestions = (token, body) =>
  request("/questions/prepare", token, { method: "POST", body: JSON.stringify(body) });

// ── SESSIONS ───────────────────────────────────────────
export const createSession = (token, body) =>
  request("/sessions/create", token, { method: "POST", body: JSON.stringify(body) });

export const getSessionHistory = (token) =>
  request("/sessions/history", token);

export const getSession = (token, sessionId) =>
  request(`/sessions/${sessionId}`, token);

export const startSession = (token, sessionId) =>
  request(`/sessions/${sessionId}/start`, token, { method: "PUT" });

export const updateCurrentQuestion = (token, sessionId, questionIndex) =>
  request(`/sessions/${sessionId}/current-question`, token, {
    method: "PUT",
    body: JSON.stringify({ questionIndex }),
  });

export const markQuestionAnswered = (token, sessionId, body) =>
  request(`/sessions/${sessionId}/question-answered`, token, {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const endSession = (token, sessionId, motionData) =>
  request(`/sessions/${sessionId}/end`, token, {
    method: "PUT",
    body: JSON.stringify({ motionData }),
  });

export const abandonSession = (token, sessionId) =>
  request(`/sessions/${sessionId}/abandon`, token, { method: "PUT" });

// ── UPLOAD ─────────────────────────────────────────────
export const uploadAudio = async (token, formData) => {
  const res = await fetch(`${BASE_URL}/upload/audio`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData, // FormData — no Content-Type header, browser sets it
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Upload failed");
  return data;
};

export const uploadFollowUpAudio = async (token, formData) => {
  const res = await fetch(`${BASE_URL}/upload/audio/followup`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Follow-up upload failed");
  return data;
};

// ── TRANSCRIPTION ──────────────────────────────────────
export const transcribeSession = (token, sessionId) =>
  request(`/transcription/session/${sessionId}`, token, { method: "POST" });

export const getTranscripts = (token, sessionId) =>
  request(`/transcription/session/${sessionId}`, token);

// ── EVALUATION ─────────────────────────────────────────
export const evaluateSession = (token, sessionId) =>
  request(`/evaluation/session/${sessionId}`, token, { method: "POST" });

// ── REPORTS ────────────────────────────────────────────
export const generateReport = (token, sessionId) =>
  request(`/reports/session/${sessionId}/generate`, token, { method: "POST" });

export const getReport = (token, sessionId) =>
  request(`/reports/session/${sessionId}`, token);

export const getAllReports = (token) =>
  request("/reports/me", token);

export const getSharedReport = async (shareToken) => {
  const res = await fetch(`${BASE_URL}/reports/share/${shareToken}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Shared report not found");
  return data;
};

// ── ELEVENLABS ─────────────────────────────────────────
export const getQuestionAudio = async (token, text) => {
  const res = await fetch(`${BASE_URL}/elevenlabs/speak`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Audio fetch failed");
  const blob = await res.blob();
  return URL.createObjectURL(blob);
};

// ── PAYMENTS (RAZORPAY) ────────────────────────────────
export const createRazorpayOrder = (token, { packSize }) =>
  request("/payments/order", token, {
    method: "POST",
    body: JSON.stringify({ packSize }),
  });

export const verifyRazorpayPayment = (token, body) =>
  request("/payments/verify", token, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const getTransactionHistory = (token) =>
  request("/payments/history", token);
