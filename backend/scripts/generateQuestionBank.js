const mongoose = require("mongoose");
const { OpenAI } = require("openai");
require("dotenv").config();

const Question = require("../models/Question");
const Role = require("../models/Role");
const generateQuestionsPrompt = require("../prompts/generateQuestions.prompt");
const generateAnswersPrompt = require("../prompts/generateAnswers.prompt");
const {
  STACKS,
  LEVELS,
  QUESTION_BANK_TARGET,
  TIME_LIMITS,
} = require("../utils/constants");

// OpenRouter client — replaces OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5000",
    "X-Title": "Interview Platform",
  },
});

// ── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const safeParseJSON = (text) => {
  try {
    const clean = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(clean);
  } catch (err) {
    try {
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch (err2) {
      try {
        let clean = text
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        const lastComplete = clean.lastIndexOf("},");
        if (lastComplete !== -1) {
          clean = clean.substring(0, lastComplete + 1) + "]";
          return JSON.parse(clean);
        }
      } catch (err3) {
        console.error("All JSON parse attempts failed");
      }
    }
    return null;
  }
};

const validateQuestion = (q) => {
  return (
    q.question &&
    q.question.length >= 10 &&
    q.followUps &&
    q.followUps.length >= 1 &&
    q.tags &&
    q.tags.length >= 1 &&
    [1, 2, 3].includes(q.difficulty)
  );
};

const validateAnswer = (a) => {
  return typeof a === "string" && a.length >= 50;
};

const retryOnRateLimit = async (fn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const isRateLimit = err.status === 429;
      const isSSLError = err.message && err.message.includes("SSL");
      const isNetworkError = err.message && err.message.includes("terminated");

      if ((isRateLimit || isSSLError || isNetworkError) && i < retries - 1) {
        const waitTime = (i + 1) * 10000;
        console.log(
          `    Network error — waiting ${waitTime / 1000}s before retry...`,
        );
        await sleep(waitTime);
      } else {
        throw err;
      }
    }
  }
};

// ── Core generation functions ─────────────────────────────────────────────────

// 🚨 UPDATED: Added coreTopics and existingQuestions arrays into parameters to pass down context
const generateQuestions = async (roleLabel, level, category, count, coreTopics = [], existingQuestions = []) => {
  console.log(`    Generating ${count} questions — ${category}`);
  await sleep(2000);

  // Generates isolated prompt passing arrays cleanly
  const prompt = generateQuestionsPrompt(roleLabel, level, category, count, coreTopics, existingQuestions);

  const response = await retryOnRateLimit(() =>
    openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  );

  const parsed = safeParseJSON(response.choices[0].message.content);
  if (!parsed || !Array.isArray(parsed)) {
    console.error(`    Failed to parse questions for ${category}`);
    return [];
  }

  const valid = parsed.filter(validateQuestion);

  // 🚨 THE TOKEN SAVER: Filter out duplicates in JavaScript memory straight away!
  // If AI hallucinates and repeats a question already present in DB, it dies here.
  const strictlyUnique = valid.filter(q => !existingQuestions.includes(q.question));

  console.log(
    `    ${strictlyUnique.length}/${parsed.length} questions passed validation & strict uniqueness checks`,
  );
  return strictlyUnique;
};

const generateIdealAnswers = async (roleLabel, level, category, questions) => {
  console.log(`    Generating ideal answers — ${category}`);
  await sleep(2000);

  const prompt = generateAnswersPrompt(roleLabel, level, category, questions);

  const response = await retryOnRateLimit(() =>
    openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 6000,
    }),
  );

  const parsed = safeParseJSON(response.choices[0].message.content);
  if (!parsed || !Array.isArray(parsed)) {
    console.error(`    Failed to parse answers for ${category}`);
    return [];
  }

  const valid = parsed.filter(validateAnswer);
  console.log(`    ${valid.length}/${parsed.length} answers passed validation`);
  return valid;
};

// ── Save to MongoDB ───────────────────────────────────────────────────────────

const saveQuestions = async (
  questions,
  answers,
  role,
  roleLabel,
  level,
  category,
) => {
  const docs = questions
    .map((q, i) => {
      if (!answers[i]) return null;
      return {
        role,
        roleLabel,
        level,
        category,
        question: q.question,
        idealAnswer: answers[i],
        followUps: q.followUps || [],
        difficulty: q.difficulty,
        timeLimit: TIME_LIMITS[category],
        tags: q.tags || [],
        isAIGenerated: true,
        generatedAt: new Date(),
        isActive: true,
      };
    })
    .filter(Boolean);

  if (docs.length === 0) {
    console.error(`    No valid docs to save for ${category}`);
    return 0;
  }

  await Question.insertMany(docs);
  console.log(`    Saved ${docs.length} questions to MongoDB`);
  return docs.length;
};

// ── Per combination runner ────────────────────────────────────────────────────

const generateForCombo = async (stack, level) => {
  const { role, roleLabel, coreTopics } = stack; // Extract coreTopics array safely
  const categories = QUESTION_BANK_TARGET[level];
  let totalSaved = 0;

  for (const [category, count] of Object.entries(categories)) {
    // 🚨 UPDATED: Pull actual documents from collection instead of a blind count
    const existingDocs = await Question.find(
      { role, level, category, isActive: true },
      { question: 1 } // Project only 'question' field to save memory bandwidth
    );

    const existingCount = existingDocs.length;
    const existingQuestionTexts = existingDocs.map(d => d.question);

    if (existingCount >= count) {
      console.log(
        `    Skipping ${category} — already have ${existingCount}/${count}`,
      );
      continue;
    }

    const needed = count - existingCount;
    console.log(
      `    Need ${needed} more for ${category} (have ${existingCount}/${count})`,
    );

    try {
      // Passes stack-topics and existing question texts right down to generator pipeline
      const questions = await generateQuestions(
        roleLabel,
        level,
        category,
        needed,
        coreTopics || [],
        existingQuestionTexts
      );
      if (questions.length === 0) continue;

      await sleep(3000);

      const answers = await generateIdealAnswers(
        roleLabel,
        level,
        category,
        questions,
      );
      if (answers.length === 0) continue;

      const saved = await saveQuestions(
        questions,
        answers,
        role,
        roleLabel,
        level,
        category,
      );

      totalSaved += saved;
      await sleep(3000);
    } catch (err) {
      console.error(`    Error on ${category}:`, err.message);
      continue;
    }
  }

  return totalSaved;
};

// ── Update Role collection ────────────────────────────────────────────────────

const upsertRole = async (role, roleLabel, level, questionCount) => {
  await Role.findOneAndUpdate(
    { role, level },
    {
      role,
      roleLabel,
      level,
      questionCount,
      source: "pre_generated",
      isActive: true,
    },
    { upsert: true, new: true },
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────

const generateAll = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB\n");

  let grandTotal = 0;

  for (const stack of STACKS) {
    for (const level of LEVELS) {
      console.log(`\nProcessing: ${stack.roleLabel} — ${level}`);
      console.log("─".repeat(50));

      try {
        const saved = await generateForCombo(stack, level);
        grandTotal += saved;

        const totalCount = await Question.countDocuments({
          role: stack.role,
          level,
          isActive: true,
        });

        await upsertRole(stack.role, stack.roleLabel, level, totalCount);
        console.log(`  Done — ${saved} new questions saved`);
      } catch (err) {
        console.error(`  Failed: ${stack.roleLabel} - ${level}`, err.message);
      }

      await sleep(5000);
    }
  }

  console.log("\n" + "═".repeat(50));
  console.log(`Generation complete — ${grandTotal} total questions saved`);
  console.log("═".repeat(50));

  await mongoose.disconnect();
  process.exit(0);
};

generateAll();