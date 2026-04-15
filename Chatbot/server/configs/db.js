import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionString = `${process.env.MONGODB_URI}/Chatbot`;

    // Set connection options for better reliability
    const options = {
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
    };

    await mongoose.connect(connectionString, options);

    mongoose.connection.on("connected", () => {
      console.log("✅ Database connected successfully");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ Database connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ Database disconnected");
    });

    console.log("✅ MongoDB connection established");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1); // Exit the process if database connection fails
  }
};

export default connectDB;
