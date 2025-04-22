import mongoose from "mongoose";

const connectMongoDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    //   console.log(mongoUri)
    if (!mongoUri) {
      throw new Error("MONGODB_URI environment variable is not defined");
    }
    // Connect to MongoDB
    await mongoose.connect(mongoUri, { dbName: "Finder-App" });
    // Check if MongoDB connection is successful
    const dbConnection = mongoose.connection;
    if (mongoose.connection.readyState === 1) console.log("DB Connected");
  } catch (error) {
    console.error("Connection Error DB", error);
    // Rethrow the error so it can be caught in the calling function
    throw error;
  }
};

export default connectMongoDB;
