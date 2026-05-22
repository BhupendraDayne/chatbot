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

const app =express()

await connectDB()

//Stripe webhooks
app.post('/api/stripe',express.raw({type:"application/json"}),
stripeWebhooks)
// middleware
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

const PORT = process.env.PORT || 3000
app.listen(PORT, ()=>{
    console.log(`server is running on port ${PORT}`);
    
})
export default app;