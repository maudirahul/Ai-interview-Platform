const generateAnswersPrompt = (roleLabel, level, category, questions) => {
  const numbered = questions
    .map((q, i) => `${i + 1}. ${q.question}`)
    .join('\n');

  return `
You are a highly experienced ${roleLabel} with 10+ years of experience.
Provide ideal interview answers for the following ${level} level ${category} questions.

Rules:
- Answers must be detailed, technically accurate, and specific to ${roleLabel}
- Each answer should demonstrate the depth expected at ${level} level
- Include specific examples, tools, or techniques where relevant
- Answers should take 2-4 minutes to speak aloud
- Return ONLY a valid JSON array of strings — one answer per question in the same order
- No explanation, no markdown, no backticks, just the JSON array of strings

Questions:
${numbered}
  `;
};

module.exports = generateAnswersPrompt;