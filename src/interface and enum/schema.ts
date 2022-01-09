
enum MessageType {
    DM='dm',
    CHANNEL='channel'
}
enum MessageStatus {
    PROCESSING = 'PROCESSING',
    CANCELLED = 'CANCELLED',
    SENT = 'SENT',
}
interface Message{
    messageId:String,
    targetGuild:String,
    type:MessageType,
    channels?:Array<String>,
    members?:Array<String>,
    roles?:Array<String>,
    title:String,
    message:String,
    sender:String,
    createTime:Date,
    delivertime:Date,
    preview?:Boolean,
    status:MessageStatus,
    favourite:Boolean
}

export {Message,MessageStatus,MessageType}