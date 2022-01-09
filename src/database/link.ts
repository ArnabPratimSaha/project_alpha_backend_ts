import mongoose from 'mongoose';
interface Link {
    discordId: String,
    entryId: String,
    entryTime: Date,
    OTP?: String
}
const linkSchema=new mongoose.Schema<Link>({
    discordId:{ type:String,required:true},
    entryId:{type:String,required:true},
    entryTime:{type:Date,required:true,default:new Date()},
    OTP: { type: String}
});
const LinkModel=mongoose.model<Link>('Link',linkSchema);
export {LinkModel};