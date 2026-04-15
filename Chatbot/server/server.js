import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import messageRoter from "./routes/messageRoutes.js";
import creditRouter from "./routes/credit.Routes.js";
import { stripeWebhooks } from "./controllers/webhooks.js";

const app = express();

// Connect to database first
console.log("🔄 Connecting to database...");
try {
  await connectDB();
  console.log("✅ Database connection successful");
} catch (error) {
  console.error("❌ Failed to connect to database:", error);
  process.exit(1);
}

//Stripe webhooks
app.post(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks,
);
// middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => res.send("server is Live"));
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRoter);
app.use("/api/credit", creditRouter);

// 404 Error Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
export default app;
