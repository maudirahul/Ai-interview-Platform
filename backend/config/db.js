const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB conneted successfully");
  } catch (error) {
    console.log("MongoDB error : ", error);
  }
};

module.exports=connectDB;