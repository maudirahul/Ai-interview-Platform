const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const errorMiddleware = require("./middleware/error.middleware");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/sessions", require("./routes/session.routes"));
app.use("/api/questions", require("./routes/question.routes"));
app.use("/api/upload", require("./routes/upload.routes"));
app.use("/api/transcription", require("./routes/transcription.routes"));
app.use("/api/evaluation", require("./routes/evaluation.routes"));
app.use("/api/reports", require("./routes/report.routes"));
app.use("/api/elevenlabs", require("./routes/tts.routes"));
// app.use('/api/admin',         require('./routes/admin.routes'));

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
