const cloudinaryService = require("../services/cloudinary.service");
const Transcript = require("../models/Transcript");
const Session = require("../models/Session");

const isValidAudioBuffer = (file) => {
  const buffer = file?.buffer;
  const mimeType = file?.mimetype || "";

  if (!buffer || buffer.length < 12) return false;

  if (mimeType.includes("webm")) {
    return buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3;
  }

  if (mimeType.includes("ogg")) {
    return buffer.subarray(0, 4).toString("ascii") === "OggS";
  }

  if (mimeType.includes("wav")) {
    return (
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WAVE"
    );
  }

  if (mimeType.includes("mp4")) {
    return buffer.subarray(4, 8).toString("ascii") === "ftyp";
  }

  if (mimeType.includes("mpeg")) {
    return (
      buffer.subarray(0, 3).toString("ascii") === "ID3" ||
      (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0)
    );
  }

  return true;
};

// Upload audio for a question answer
const uploadAudio = async (req, res, next) => {
  try {
    // Get file from req.files (upload.any()) or req.file (upload.single())
    const file = req.file;
    console.log("req.file =", req.file);
    console.log("req.files =", req.files);
    if (file) {
      console.log("Received File:", file);
      console.log("Original Name:", file.originalname);
      console.log("Mime Type:", file.mimetype);
      console.log("Size:", file.size);
      console.log("Buffer Length:", file.buffer?.length);
    }
    // Trim all body fields to handle accidental spaces
    const sessionId = req.body.sessionId?.trim();
    const questionId = req.body.questionId?.trim();
    const questionOrder = req.body.questionOrder?.trim();
    const questionText = req.body.questionText?.trim();
    const category = req.body.category?.trim();
    const answerDuration = req.body.answerDuration?.trim();

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No audio file provided",
      });
    }

    if (!file.buffer || file.size < 1024) {
      return res.status(400).json({
        success: false,
        message: "Recorded audio is empty or too short. Please try again.",
      });
    }

    if (!isValidAudioBuffer(file)) {
      return res.status(400).json({
        success: false,
        message: "Recorded audio file is incomplete. Please record this answer again.",
      });
    }

    if (!sessionId || !questionId || !questionOrder) {
      return res.status(400).json({
        success: false,
        message: "sessionId, questionId and questionOrder are required",
      });
    }

    // Verify session belongs to user
    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Upload audio to cloudinary
    const fileName = `session_${sessionId}_q${questionOrder}_${Date.now()}`;
    const uploadResult = await cloudinaryService.uploadAudio(
      file.buffer,
      fileName,
      file.mimetype,
    );

    // Save transcript document
    const transcript = await Transcript.create({
      sessionId,
      userId: req.user._id,
      questionId,
      questionOrder: parseInt(questionOrder),
      questionText: questionText || "",
      category: category || "role_specific",
      audioUrl: uploadResult.secure_url,
      transcriptionStatus: "pending",
      evaluationStatus: "pending",
      answerDuration: parseInt(answerDuration) || null,
    });

    res.status(201).json({
      success: true,
      transcript: {
        _id: transcript._id,
        audioUrl: transcript.audioUrl,
        questionOrder: transcript.questionOrder,
        transcriptionStatus: transcript.transcriptionStatus,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Upload follow up audio
const uploadFollowUpAudio = async (req, res, next) => {
  try {
    const file = (req.files && req.files[0]) || req.file;

    const transcriptId = req.body.transcriptId?.trim();
    const followUpDuration = req.body.followUpDuration?.trim();

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No audio file provided",
      });
    }

    if (!file.buffer || file.size < 1024) {
      return res.status(400).json({
        success: false,
        message: "Recorded audio is empty or too short. Please try again.",
      });
    }

    if (!isValidAudioBuffer(file)) {
      return res.status(400).json({
        success: false,
        message: "Recorded audio file is incomplete. Please record this answer again.",
      });
    }

    if (!transcriptId) {
      return res.status(400).json({
        success: false,
        message: "transcriptId is required",
      });
    }

    const transcript = await Transcript.findOne({
      _id: transcriptId,
      userId: req.user._id,
    });

    if (!transcript) {
      return res.status(404).json({
        success: false,
        message: "Transcript not found",
      });
    }

    // Upload follow up audio
    const fileName = `session_${transcript.sessionId}_q${transcript.questionOrder}_followup_${Date.now()}`;
    const uploadResult = await cloudinaryService.uploadAudio(
      file.buffer,
      fileName,
      file.mimetype,
    );

    transcript.followUpAudioUrl = uploadResult.secure_url;
    transcript.followUpDuration = parseInt(followUpDuration) || null;
    await transcript.save();

    res.status(200).json({
      success: true,
      transcript: {
        _id: transcript._id,
        followUpAudioUrl: transcript.followUpAudioUrl,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadAudio, uploadFollowUpAudio };
