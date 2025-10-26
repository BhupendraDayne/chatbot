import mongoose from "mongoose";
import bcrypt from 'bcryptjs'
//create schema
const userSchema =new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true, unique:true },
    password:{type:String, required:true},
    credits:{type:String, default: 500 },
})
// hash password before saving
userSchema.pre('save',async function (next) {
    if(!this.isModified('password')){
        return next()
    }
    const salt =await bcrypt.genSalt(10)
    this.password =await bcrypt.hash(this.password, salt)
    next();
})
//create model
const User =mongoose.model('User',userSchema);
export default User;