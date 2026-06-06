const questionService = require("../services/question.service");

// Get all available roles
const getRoles = async (req, res, next) => {
  try {
    const roles = await questionService.getAvailableRoles();
    res.status(200).json({
      success: true,
      roles,
    });
  } catch (err) {
    next(err);
  }
};

// Prepare questions for a session
// Checks DB first, generates if not enough exist
const prepareQuestions = async (req, res, next) => {
  try {
    const { role, roleLabel, level } = req.body;

    if (!role || !roleLabel || !level) {
      return res.status(400).json({
        success: false,
        message: "role, roleLabel and level are required",
      });
    }

    const validLevels = ["fresher", "mid", "senior"];
    if (!validLevels.includes(level)) {
      return res.status(400).json({
        success: false,
        message: "level must be fresher, mid or senior",
      });
    }

    const questions = await questionService.buildQuestionSet(
      role,
      roleLabel,
      level,
    );

    if (questions.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to prepare questions, please try again",
      });
    }

    res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRoles, prepareQuestions };
