const { OpenAI } = require("openai");
const Groq = require("groq-sdk");
const fs = require("fs");
const os = require("os");
const path = require("path");

// OpenRouter client — for text models
const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5000",
    "X-Title": "Interview Platform",
  },
});

// Groq client — for Whisper transcription
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ── Transcribe audio using Groq Whisper ───────────────────────────────────────
const getAudioExtension = (contentType = "", audioUrl = "") => {
  if (contentType.includes("webm")) return "webm";
  if (contentType.includes("ogg")) return "ogg";
  if (contentType.includes("mp4")) return "mp4";
  if (contentType.includes("mpeg")) return "mp3";
  if (contentType.includes("wav")) return "wav";

  try {
    const ext = path.extname(new URL(audioUrl).pathname).replace(".", "");
    if (
      ["webm", "ogg", "mp4", "mp3", "mpeg", "mpga", "wav", "m4a"].includes(
        ext,
      )
    ) {
      return ext;
    }
  } catch (err) {
    // Ignore malformed URLs and fall back to the browser's most common format.
  }

  return "webm";
};

const transcribeAudio = async (audioUrl, questionContext) => {
  let tempPath = null; // Declare the path outside so the finally block can see it

  try {
    const response = await fetch(audioUrl);
    if (!response.ok) {
      throw new Error(
        `Audio download failed: ${response.status} ${response.statusText}`,
      );
    }

    const contentType = response.headers.get("content-type") || "";
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length < 1024) {
      throw new Error("Downloaded audio is empty or too small to transcribe");
    }

    const extension = getAudioExtension(contentType, audioUrl);
    tempPath = path.join(
      os.tmpdir(),
      `interview_audio_${Date.now()}_${Math.random().toString(36).slice(2)}.${extension}`,
    );

    // Save to disk temporarily
    fs.writeFileSync(tempPath, buffer);

    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tempPath),
      model: "whisper-large-v3",
      language: "en",
      prompt: questionContext,
    });

    return transcription.text;
  } catch (err) {
    console.error("Transcription error:", err.message);
    throw err;
  } finally {
    if (tempPath && fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
      console.log(`Deleted temp file: ${tempPath}`);
    }
  }
};

// ── Evaluate answer using OpenRouter ─────────────────────────────────────────
const evaluateAnswer = async (
  roleLabel,
  level,
  question,
  idealAnswer,
  transcript,
  answerDuration,
) => {
  let content = "";
  try {
    const evaluateAnswerPrompt = require("../prompts/evaluateAnswer.prompt");
    const prompt = evaluateAnswerPrompt(
      roleLabel,
      level,
      question,
      idealAnswer,
      transcript,
      answerDuration,
    );

    const response = await openrouter.chat.completions.create({
      model: "google/gemma-2-27b-it",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    content = response.choices[0].message.content;
    const clean = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Remove trailing commas to prevent JSON.parse from failing
    const cleanedJson = clean.replace(/,\s*([\]}])/g, "$1");

    const parsedJson = JSON.parse(cleanedJson);

    // Calculate secure total score
    const safeTotalScore =
      (parsedJson.technical?.accuracy || 0) +
      (parsedJson.technical?.depth || 0) +
      (parsedJson.technical?.problemSolving || 0) +
      (parsedJson.communication?.clarity || 0) +
      (parsedJson.communication?.structure || 0) +
      (parsedJson.communication?.confidence || 0) +
      (parsedJson.behavioral?.relevance || 0) +
      (parsedJson.behavioral?.examples || 0) +
      (parsedJson.behavioral?.professionalism || 0);

    const normalizedEvaluation = {
      totalScore: safeTotalScore,
      feedback:
        parsedJson.feedback ||
        parsedJson.overallFeedback ||
        "Evaluation processed successfully.",
      highlight: parsedJson.highlight || parsedJson.strength || null,
      improvement: parsedJson.improvement || parsedJson.weakness || null,
      needsFollowUp: parsedJson.needsFollowUp || false,

      technical: {
        accuracy: parsedJson.technical?.accuracy ?? 0,
        depth: parsedJson.technical?.depth ?? 0,
        problemSolving: parsedJson.technical?.problemSolving ?? 0,
        feedback:
          parsedJson.technical?.feedback ||
          parsedJson.technical?.comments ||
          "Technical response addressed standard parameters.",
      },

      communication: {
        clarity: parsedJson.communication?.clarity ?? 0,
        structure: parsedJson.communication?.structure ?? 0,
        confidence: parsedJson.communication?.confidence ?? 0,
        feedback:
          parsedJson.communication?.feedback ||
          parsedJson.communication?.comments ||
          "Pacing and presentation matched level baseline.",
      },

      behavioral: {
        relevance: parsedJson.behavioral?.relevance ?? 0,
        examples: parsedJson.behavioral?.examples ?? 0,
        professionalism: parsedJson.behavioral?.professionalism ?? 0,
        feedback:
          parsedJson.behavioral?.feedback ||
          parsedJson.behavioral?.comments ||
          "Professional delivery aligned with core scenario goals.",
      },
    };

    return normalizedEvaluation;
  } catch (err) {
    console.error(
      "Evaluation error during OpenRouter call or JSON parsing:",
      err.message,
    );
    if (content) {
      console.error("Raw LLM response content was:", content);
    }
    throw err;
  }
};

module.exports = { transcribeAudio, evaluateAnswer };
