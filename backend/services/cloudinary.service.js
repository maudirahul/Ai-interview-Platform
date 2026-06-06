const cloudinary = require("../config/cloudinary");

const getFormatFromMimeType = (mimeType = "") => {
  if (mimeType.includes("webm")) return "webm";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("mpeg")) return "mp3";
  if (mimeType.includes("wav")) return "wav";
  return "webm";
};

// Upload audio buffer to cloudinary
const uploadAudio = async (fileBuffer, fileName, mimeType = "") => {
  console.log("=== Upload Debug ===");
  console.log("File Name:", fileName);
  console.log("Buffer Size:", fileBuffer?.length);
  console.log("Buffer Exists:", !!fileBuffer);
  console.log("Mime Type:", mimeType);

  const format = getFormatFromMimeType(mimeType);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "interview-platform/audio",
        public_id: `${fileName}.${format}`,
      },
      (err, result) => {
        if (err) {
          console.error("Cloudinary upload raw error:", err);
          return reject(err);
        }
        resolve(result);
      },
    );
    uploadStream.end(fileBuffer);
  });
};

// Delete audio from cloudinary
const deleteAudio = async (publicId) => {
  return await cloudinary.uploader.destroy(publicId, {
    resource_type: "raw",
  });
};

module.exports = { uploadAudio, deleteAudio };
