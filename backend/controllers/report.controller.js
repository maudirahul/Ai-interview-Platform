const { generateReport } = require("../services/report.service");
const Report = require("../models/Report");

// Generate report for a session
const generate = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const report = await generateReport(sessionId, req.user._id);

    res.status(201).json({
      success: true,
      report,
    });
  } catch (err) {
    if (err.message === "SESSION_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }
    if (err.message === "NO_EVALUATED_TRANSCRIPTS") {
      return res.status(400).json({
        success: false,
        message: "No evaluated transcripts found — run evaluation first",
      });
    }
    next(err);
  }
};

// Get report by session ID
const getBySession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const report = await Report.findOne({
      sessionId,
      userId: req.user._id,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.status(200).json({
      success: true,
      report,
    });
  } catch (err) {
    next(err);
  }
};

// Get report by share token — public route
const getByShareToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    const report = await Report.findOne({
      shareToken: token,
      isShareable: true,
    }).select("-userId");
    // hide userId from public share

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found or not shareable",
      });
    }

    res.status(200).json({
      success: true,
      report,
    });
  } catch (err) {
    next(err);
  }
};

// Get all reports for a user
const getUserReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ userId: req.user._id })
      .select(
        "sessionId role roleLabel level overallScore grade createdAt sessionDuration integrityScore shareToken",
      )
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { generate, getBySession, getByShareToken, getUserReports };
