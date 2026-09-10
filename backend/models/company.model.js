import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        trim: true
    },
    description:{
        type:String, 
    },
    website:{ type:String, trim: true },
    location:{
        type:String 
    },
    logo:{
        type:String // URL to company logo
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
},{timestamps:true})
companySchema.index({ userId: 1, createdAt: -1 });
export const Company = mongoose.model("Company", companySchema);
