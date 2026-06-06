const Transcript = require('../models/Transcript');
const Question = require('../models/Question');
const { evaluateAnswer } = require('./openai.service');
const { GRADE_THRESHOLDS } = require('../utils/constants');

// Calculate grade from score
const getGrade = (score) => {
  for (const threshold of GRADE_THRESHOLDS) {
    if (score >= threshold.min) return threshold.grade;
  }
  return 'F';
};

// Evaluate all transcripts for a session
const evaluateSession = async (sessionId, userId, roleLabel, level) => {

  const transcripts = await Transcript.find({
    sessionId,
    userId,
    transcriptionStatus: 'completed',
    evaluationStatus: 'pending',
  }).sort({ questionOrder: 1 });

  if (transcripts.length === 0) {
    throw new Error('NO_TRANSCRIPTS_FOUND');
  }

  const evaluationResults = [];

  for (const transcript of transcripts) {

    try {
      await Transcript.findByIdAndUpdate(transcript._id, {
        evaluationStatus: 'processing',
      });

      // Get ideal answer from question
      const question = await Question.findById(transcript.questionId);
      if (!question) continue;

      // Evaluate with GPT-4o
      const evaluation = await evaluateAnswer(
        roleLabel,
        level,
        transcript.questionText,
        question.idealAnswer,
        transcript.transcript,
        transcript.answerDuration
      );

      // Save evaluation to transcript
      await Transcript.findByIdAndUpdate(transcript._id, {
        evaluationStatus: 'completed',
        evaluation,
      });

      evaluationResults.push({
        transcriptId: transcript._id,
        questionOrder: transcript.questionOrder,
        questionText: transcript.questionText,
        category: transcript.category,
        evaluation,
        answerDuration: transcript.answerDuration,
        followUpAsked: transcript.followUpAsked,
      });

    } catch (err) {
      await Transcript.findByIdAndUpdate(transcript._id, {
        evaluationStatus: 'failed',
      });
      console.error(`Evaluation failed for question ${transcript.questionOrder}:`, err.message);
    }
  }

  return evaluationResults;
};

module.exports = { evaluateSession, getGrade };