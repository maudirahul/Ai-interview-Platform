const { OpenAI } = require("openai");
const Question = require("../models/Question");
const Role = require("../models/Role");
const shuffle = require("../utils/shuffle");
const generateQuestionsPrompt = require("../prompts/generateQuestions.prompt");
const generateAnswersPrompt = require("../prompts/generateAnswers.prompt");
const {
  STACKS, 
  QUESTION_MIX,
  QUESTION_BANK_TARGET,
  TIME_LIMITS,
} = require("../utils/constants");

const openai = new OpenAI({ apiKey: process.env.OPENROUTER_API_KEY });

// ── Helpers ───────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const safeParseJSON = (text) => {
  try {
    const clean = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(clean);
  } catch (err) {
    return null;
  }
};

// ── On demand generation ──────────────────────────────────────────────────────

const generateAndStoreQuestions = async (role, roleLabel, level) => {
  const categories = QUESTION_BANK_TARGET[level];

  //  Extract the core language topics configuration for this specific role profile
  const currentStack = STACKS.find((s) => s.role === role);
  const coreTopics = currentStack ? currentStack.coreTopics : [];

  for (const [category, count] of Object.entries(categories)) {
 
    const existingDocs = await Question.find(
      { role, level, category, isActive: true },
      { question: 1 }, // Grab only the question text string field to protect memory
    );

    const existingCount = existingDocs.length;
    const existingQuestionTexts = existingDocs.map((d) => d.question);

    if (existingCount >= count) continue;

    const needed = count - existingCount;

    try {
      // Generate questions passing the context sandboxing & deduplication requirements
      const qPrompt = generateQuestionsPrompt(
        roleLabel,
        level,
        category,
        needed,
        coreTopics,
        existingQuestionTexts,
      );

      const qResponse = await openai.chat.completions.create({
        model: "meta-llama/llama-3.3-8b-instruct",
        messages: [{ role: "user", content: qPrompt }],
        temperature: 0.7,
      });

      const parsedQuestions = safeParseJSON(
        qResponse.choices[0].message.content,
      );
      if (!parsedQuestions || !Array.isArray(parsedQuestions)) continue;

      // Filter out structural duplicates right here in volatile memory
      const strictlyUniqueQuestions = parsedQuestions.filter(
        (q) => q && q.question && !existingQuestionTexts.includes(q.question),
      );

      // If AI over-hallucinates and yields nothing new, abort early to protect downstream credits
      if (strictlyUniqueQuestions.length === 0) {
        console.log(
          `    [On-Demand Engine]: Duplicates caught in memory for ${category}. Aborting ideal answer loop.`,
        );
        continue;
      }

      await sleep(1000);

      // Generate ideal answers with high tier structural models passing only the unique items
      const aPrompt = generateAnswersPrompt(
        roleLabel,
        level,
        category,
        strictlyUniqueQuestions,
      );

      const aResponse = await openai.chat.completions.create({
        model: "meta-llama/llama-3.3-70b-instruct:free",
        messages: [{ role: "user", content: aPrompt }],
        temperature: 0.5,
      });

      const answers = safeParseJSON(aResponse.choices[0].message.content);
      if (!answers || !Array.isArray(answers)) continue;

      // Map verified documents cleanly down into MongoDB configurations
      const docs = strictlyUniqueQuestions
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

      if (docs.length > 0) {
        await Question.insertMany(docs);
        console.log(
          `    [On-Demand Engine]: Successfully synchronized ${docs.length} unique questions for ${category}.`,
        );
      }

      await sleep(1500);
    } catch (err) {
      console.error(`Generation failed for ${category}:`, err.message);
      continue;
    }
  }

  // Update global role collection state counter tracking metrics
  const totalCount = await Question.countDocuments({
    role,
    level,
    isActive: true,
  });

  await Role.findOneAndUpdate(
    { role, level },
    {
      role,
      roleLabel,
      level,
      questionCount: totalCount,
      source: "on_demand",
      isActive: true,
    },
    { upsert: true, new: true },
  );
};

// ── Build session question set ────────────────────────────────────────────────

const buildQuestionSet = async (role, roleLabel, level) => {
  // Check global structural presence constraints
  const totalExisting = await Question.countDocuments({
    role,
    level,
    isActive: true,
  });

  // Launch targeted safety recovery execution loops if the threshold limits aren't hit
  if (totalExisting < 30) {
    console.log(
      `Not enough questions for ${roleLabel} ${level} (Found: ${totalExisting}) — running on-demand secure generator...`,
    );
    await generateAndStoreQuestions(role, roleLabel, level);
  }

  // Pull balanced question clusters according to the target parameters
  const mix = QUESTION_MIX[level];
  let questions = [];

  for (const [category, count] of Object.entries(mix)) {
    const qs = await Question.aggregate([
      { $match: { role, level, category, isActive: true } },
      { $sample: { size: count } },
    ]);
    questions.push(...qs);
  }

  // Scramble the indices to provide an authentic, randomized pipeline presentation order
  return shuffle(questions);
};

// ── Get all available roles ───────────────────────────────────────────────────

const getAvailableRoles = async () => {
  const roles = await Role.find({ isActive: true })
    .select("role roleLabel level questionCount source")
    .sort({ servedCount: -1 });
  return roles;
};

// ── Increment served count ────────────────────────────────────────────────────

const incrementServedCount = async (role, level) => {
  await Role.findOneAndUpdate({ role, level }, { $inc: { servedCount: 1 } });
};

module.exports = {
  buildQuestionSet,
  getAvailableRoles,
  incrementServedCount,
  generateAndStoreQuestions,
};
