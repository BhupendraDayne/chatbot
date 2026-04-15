import mongoose, { Schema } from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userName: { type: String, required: true },
    name: { type: String, required: true },
    messages: [
<<<<<<< HEAD
      {
        isImage: { type: Boolean, required: true },
        isPublished: { type: Boolean, default: false },
        role: { type: String, required: true },
        content: { type: String, required: true },
        timestamp: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true },
);
=======
       {  
           
          role:{type:String, required:true},
          content:{type:String, required:true},
          timestamp:{type:Number,required:true}
    }
    ]
    
},{timestamps:true}) 
>>>>>>> d00d8294b5c9180b12c1451fa4f565811f73348b

const Chat = mongoose.model("Chat", ChatSchema);
export default Chat;
