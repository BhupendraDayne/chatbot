import mongoose, { Schema } from 'mongoose'

const ChatSchema = new  mongoose.Schema({
    userId :{type:String, ref: 'User' , required:true},
    userName :{type:String, required:true},
    name :{type:String, required:true},
    messages: [
       {  
          role:{type:String, required:true},
          content:{type:String, required:true},
          timestamp:{type:Number,required:true},
          isImage: {type: Boolean, default: false},
          locationType: {type: String, enum: ['doctors', 'hospitals'], default: null},
          locationData: {type: Array, default: []}
    }
    ]
    
},{timestamps:true}) 

const Chat = mongoose.model('Chat', ChatSchema)

export default Chat;