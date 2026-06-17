<<<<<<< HEAD
import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import messageRoter from "./routes/messageRoutes.js";
import creditRouter from "./routes/credit.Routes.js";
import nearbyRouter from "./routes/nearbyRoutes.js";
import feedbackRouter from "./routes/feedbackRoutes.js";
import { stripeWebhooks } from "./controllers/webhooks.js";
=======
import express from "express"
import "dotenv/config"
import cors from "cors"
import connectDB from "./configs/db.js"
import userRouter from "./routes/userRoutes.js"
import chatRouter from "./routes/chatRoutes.js"
import messageRouter from "./routes/messageRoutes.js"
import creditRouter from "./routes/credit.Routes.js"
import locationRouter from "./routes/locationRoutes.js"
import { stripeWebhooks } from "./controllers/webhooks.js"
>>>>>>> ec5d6bef4256aadca91b0b4a5baacfe6caa28da8

const app = express();

await connectDB();

//Stripe webhooks
app.post(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks,
);
// middleware
<<<<<<< HEAD
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => res.send("server is Live"));
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRoter);
app.use("/api/credit", creditRouter);
app.use("/api/nearby", nearbyRouter);
app.use("/api/feedback", feedbackRouter);
=======
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }))
// app.use(cors())
app.use(express.json())

// Routes
app.get("/", (req,res)=> res.send('server is Live')) 
app.use('/api/user',userRouter)
app.use('/api/chat',chatRouter)
app.use("/api/message",messageRouter)
app.use('/api/credit',creditRouter)
app.use('/api/location',locationRouter)

app.use((err, req, res, next) => {
  console.error("Global error:", err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  })
})
>>>>>>> ec5d6bef4256aadca91b0b4a5baacfe6caa28da8

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
export default app;
