const Report = require("../models/Report");
const Transcript = require("../models/Transcript");
const Session = require("../models/Session");
const { getGrade } = require("./evaluation.service");
const crypto = require("crypto");
const mongoose = require("mongoose");

const generateReport = async (sessionId, userId) => {
  // Get session
  const session = await Session.findOne({ _id: sessionId, userId });
  if (!session) throw new Error("SESSION_NOT_FOUND");

  // Check if report already exists
  const existing = await Report.findOne({ sessionId });
  if (existing) return existing;

  const sessionObjId = new mongoose.Types.ObjectId(sessionId);
  const userObjId = new mongoose.Types.ObjectId(userId.toString());

  const allTranscripts = await Transcript.find({ sessionId: sessionObjId });
  console.log('All transcripts for session:', JSON.stringify(allTranscripts, null, 2));
  console.log('Total found:', allTranscripts.length);
  console.log('Looking for userId:', userObjId);
  console.log('Looking for evaluationStatus: completed');

  // Get all evaluated transcripts
  const transcripts = await Transcript.find({
    sessionId,
    userId,
    evaluationStatus: "completed",
  }).sort({ questionOrder: 1 });

    console.log('Matching transcripts:', transcripts.length);

  if (transcripts.length === 0) {
    throw new Error("NO_EVALUATED_TRANSCRIPTS");
  }

  // ── Aggregate scores ──────────────────────────────────────────────────────

  let totalTechnicalAccuracy = 0;
  let totalTechnicalDepth = 0;
  let totalTechnicalProblemSolving = 0;
  let totalCommunicationClarity = 0;
  let totalCommunicationStructure = 0;
  let totalCommunicationConfidence = 0;
  let totalBehavioralRelevance = 0;
  let totalBehavioralExamples = 0;
  let totalBehavioralProfessionalism = 0;

  const questionBreakdown = [];

  for (const transcript of transcripts) {
    const e = transcript.evaluation;
    if (!e) continue;

    totalTechnicalAccuracy += e.technical?.accuracy || 0;
    totalTechnicalDepth += e.technical?.depth || 0;
    totalTechnicalProblemSolving += e.technical?.problemSolving || 0;
    totalCommunicationClarity += e.communication?.clarity || 0;
    totalCommunicationStructure += e.communication?.structure || 0;
    totalCommunicationConfidence += e.communication?.confidence || 0;
    totalBehavioralRelevance += e.behavioral?.relevance || 0;
    totalBehavioralExamples += e.behavioral?.examples || 0;
    totalBehavioralProfessionalism += e.behavioral?.professionalism || 0;

    questionBreakdown.push({
      questionId: transcript.questionId,
      questionOrder: transcript.questionOrder,
      questionText: transcript.questionText,
      category: transcript.category,
      score: e.totalScore || 0,
      feedback: e.feedback || null,
      technicalScore: {
        accuracy: e.technical?.accuracy || 0,
        depth: e.technical?.depth || 0,
        problemSolving: e.technical?.problemSolving || 0,
        feedback: e.technical?.feedback || null,
      },
      communicationScore: {
        clarity: e.communication?.clarity || 0,
        structure: e.communication?.structure || 0,
        confidence: e.communication?.confidence || 0,
        feedback: e.communication?.feedback || null,
      },
      behavioralScore: {
        relevance: e.behavioral?.relevance || 0,
        examples: e.behavioral?.examples || 0,
        professionalism: e.behavioral?.professionalism || 0,
        feedback: e.behavioral?.feedback || null,
      },
      highlight: e.highlight || null,
      improvement: e.improvement || null,
      followUpAsked: transcript.followUpAsked || false,
      answerDuration: transcript.answerDuration || null,
    });
  }

  const count = transcripts.length;

  // Average scores across all questions
  const technicalSubtotal = Math.round(
    (totalTechnicalAccuracy +
      totalTechnicalDepth +
      totalTechnicalProblemSolving) /
      count,
  );

  const communicationSubtotal = Math.round(
    (totalCommunicationClarity +
      totalCommunicationStructure +
      totalCommunicationConfidence) /
      count,
  );

  const behavioralSubtotal = Math.round(
    (totalBehavioralRelevance +
      totalBehavioralExamples +
      totalBehavioralProfessionalism) /
      count,
  );

  const overallScore = Math.min(
    100,
    Math.round(technicalSubtotal + communicationSubtotal + behavioralSubtotal),
  );

  // ── Top strengths and improvements ───────────────────────────────────────

  const highlights = questionBreakdown
    .filter((q) => q.highlight)
    .map((q) => q.highlight)
    .slice(0, 3);

  const improvements = questionBreakdown
    .filter((q) => q.improvement)
    .map((q) => q.improvement)
    .slice(0, 3);

  // ── Integrity verdict ─────────────────────────────────────────────────────

  const motionData = session.motionData;
  let integrityVerdict = "clean";
  if (motionData.integrityScore < 60) integrityVerdict = "violated";
  else if (motionData.integrityScore < 85) integrityVerdict = "suspicious";

  // ── Create report ─────────────────────────────────────────────────────────

  const report = await Report.create({
    sessionId,
    userId,
    role: session.role,
    roleLabel: session.roleLabel,
    level: session.level,
    overallScore,
    grade: getGrade(overallScore),

    technicalScore: {
      subtotal: technicalSubtotal,
      accuracy: Math.round(totalTechnicalAccuracy / count),
      depth: Math.round(totalTechnicalDepth / count),
      problemSolving: Math.round(totalTechnicalProblemSolving / count),
      feedback: null,
    },

    communicationScore: {
      subtotal: communicationSubtotal,
      clarity: Math.round(totalCommunicationClarity / count),
      structure: Math.round(totalCommunicationStructure / count),
      confidence: Math.round(totalCommunicationConfidence / count),
      feedback: null,
    },

    behavioralScore: {
      subtotal: behavioralSubtotal,
      relevance: Math.round(totalBehavioralRelevance / count),
      examples: Math.round(totalBehavioralExamples / count),
      professionalism: Math.round(totalBehavioralProfessionalism / count),
      feedback: null,
    },

    questionBreakdown,
    integrityScore: motionData.integrityScore,

    integrityDetails: {
      lookAwayCount: motionData.lookAwayCount,
      phoneDetectedCount: motionData.phoneDetectedCount,
      multiplePersonCount: motionData.multiplePersonCount,
      verdict: integrityVerdict,
    },

    topStrengths: highlights,
    topImprovements: improvements,
    sessionDuration: session.totalDuration,
    isShareable: true,
    shareToken: crypto.randomBytes(16).toString("hex"),
  });

  // Mark session report as generated
  await Session.findByIdAndUpdate(sessionId, {
    reportGenerated: true,
    reportId: report._id,
  });

  return report;
};

module.exports = { generateReport };
