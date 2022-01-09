import mongoose from 'mongoose';
interface User{
    userName: String,
    userTag: String,
    userId: String,
    discordId: String,
    refreshtoken: Array<String>,
    avatar: String,
}
const userSchema:mongoose.Schema = new mongoose.Schema<User>({
    userName: { type: String, required: true },
    userTag: { type: String, required: true },
    userId: { type: String, required: true,unique:true },
    discordId: { type: String, required: true  },
    refreshtoken: [{type:String}],
    avatar: { type: String },
});

const UserModel=mongoose.model<User>('User',userSchema);
export {UserModel}