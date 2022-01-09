import mongoose from 'mongoose'
import {Message,MessageStatus,MessageType} from '../interface and enum/schema';


const messageSchema=new mongoose.Schema<Message>({
    messageId:{type:String,required:true},
    targetGuild:{type:String,required:true},
    type:{type:String,enum:Object.values(MessageType),default:MessageType.CHANNEL,required:true },
    channels:[{type:String,maxlength:200}],
    members:[{type:String,maxlength:200}],
    roles:[{type:String,maxlength:200}],
    title:{type:String,required:true},
    message:{type:String,required:true},
    sender:{type:String,required:true},
    createTime:{type:Date,default:new Date(),required:true},
    delivertime:{type:Date,default:new Date(),required:true},
    preview:{type:Boolean},
    status:{type:String,enum:[MessageStatus.SENT,MessageStatus.CANCELLED,MessageStatus.PROCESSING],default:MessageStatus.PROCESSING,required:true},
    favourite:{type:Boolean,default:false}
});

const MessageModel=mongoose.model<Message>('Message',messageSchema)
export {MessageModel,MessageType,MessageStatus,Message}