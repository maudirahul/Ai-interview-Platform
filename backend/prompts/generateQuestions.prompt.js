/**
 * Generates isolated system prompts based on specific round categories
 * to prevent context bleeding and enforce token-saving deduplication.
 */
const generateQuestionsPrompt = (
  roleLabel,
  level,
  category,
  count,
  coreTopics = [],
  existingQuestions = []
) => {
  let categoryInstructions = "";

  // ── CATEGORY SANDBOXING ────────────────────────────────────────────────────
  switch (category) {
    case "role_specific":
      categoryInstructions = `You are an elite interviewer assessing a ${level}-level ${roleLabel}.
Generate exactly ${count} practical technical questions for the "${category}" round.
You MUST distribute these questions across the following core stack elements and language foundations:
${coreTopics.map((topic) => `- ${topic}`).join("\n")}

Focus heavily on core language-level runtimes, syntax limits (scoping, closures, execution loops), memory handling, and real-world framework architectural quirks.
🚨 CRITICAL BALANCE REQUIREMENT: You MUST ensure that at least 50% of the generated questions focus strictly on core programming language-level foundations (e.g., for JavaScript roles: closures, scopes, asynchronous event loop, prototypes, V8 memory; for Python roles: decorators, generators, GIL, asyncio; for Java: JVM memory, garbage collection, multithreading) rather than framework APIs or library features.`;
      break;

    case "dsa":
      categoryInstructions = `You are a pure Algorithms interviewer assessing a ${level}-level Software Engineer.
Generate exactly ${count} distinct Data Structures and Algorithms (DSA) questions.
Focus strictly on: Arrays, Strings, Hash Maps, Linked Lists, Trees, Graphs, Sorting/Searching algorithms, and Time/Space complexity analysis.
🚨 CRITICAL COMPLIANCE: The questions must be language-agnostic. Do NOT mention specific stack frameworks, libraries, or databases (like React, Node, Express, Python, or MongoDB).`;
      break;

    case "cs_fundamentals":
      categoryInstructions = `You are a Computer Science Professor conducting a baseline theory assessment for a ${level}-level candidate.
Generate exactly ${count} distinct questions covering core CS fundamentals.
Focus strictly on:
1. Operating Systems (Process vs Thread, Concurrency, Deadlocks, Scheduling, Memory Virtualization).
2. Computer Networking (HTTP/HTTPS handshakes, TCP vs UDP, DNS lifecycle, WebSockets, OSI boundaries).
3. Database Systems (ACID design, Indexing performance, Normalization vs Denormalization tradeoffs).
🚨 CRITICAL COMPLIANCE: Do NOT link these deep engineering concepts to specific web frameworks or backend libraries.`;
      break;

    case "system_design":
      categoryInstructions = `You are a Principal Systems Architect interviewing a ${level}-level candidate.
Generate exactly ${count} System Design and Scalability questions.
Focus on: High-level infrastructure topologies, Load balancing, CDN distribution, Caching patterns, Database Sharding/Replication, Microservices decoupling, and Rate-limiting architectures. Scale the complexity properly for a ${level} level.`;
      break;

    case "behavioral":
      categoryInstructions = `You are an Engineering Manager conducting a behavioral culture fit loop.
Generate exactly ${count} behavioral interview questions tailored for a ${level}-level engineer.
Focus on conflict resolution within scrum teams, handling critical production outages, managing strict deadlines, and handling code legacy technical debt. Questions should implicitly guide answers toward the STAR method.`;
      break;

    case "communication":
      categoryInstructions = `You are a core specialist assessing an engineer's articulation limits.
Generate exactly ${count} communication scenarios.
Focus on situations where they must explain a critical system architecture outage to non-technical stakeholders, defend an architectural design decision to a client, or manage cross-functional product alignments.`;
      break;

    default:
      categoryInstructions = `Generate exactly ${count} interview questions under the category description: ${category} for a ${level}-level ${roleLabel}.`;
  }

  // ── BASE PROMPT ASSEMBLY ───────────────────────────────────────────────────
  let promptText = `
${categoryInstructions}

Rules:
- Questions must be clear, unambiguous, and answerable in 2-5 minutes.
- Difficulty must be strictly appropriate for a ${level} tier candidate.
- Return ONLY a raw, valid JSON array matching the required schema. Do not add markdown notes, conversational chatter, backticks, or introductory phrases.

Each object in the array must follow this exact structure:
{
  "question": "the full question text",
  "difficulty": 1 or 2 or 3,
  "tags": ["tag1", "tag2", "tag3"],
  "followUps": ["follow up question 1", "follow up question 2"]
}

difficulty: 1=straightforward, 2=moderate, 3=challenging for ${level} level.
tags: specific technical topics this question covers.
followUps: 2 deeper context-drilling questions to ask if the user's initial response is shallow.`;

  // ── DEDUPLICATION INSURANCE LINE ───────────────────────────────────────────
  if (existingQuestions && existingQuestions.length > 0) {
    promptText += `

🚨 CRITICAL ACCURACY REQUIREMENT:
To avoid repeating content, you are forbidden from generating, clone-phrasing, or re-verifying any concepts matching these existing database question entries:
${existingQuestions.map((q) => `- ${q}`).join("\n")}`;
  }

  return promptText.trim();
};

module.exports = generateQuestionsPrompt;