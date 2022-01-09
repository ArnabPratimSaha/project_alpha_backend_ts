import mongoose,{Schema} from 'mongoose';
interface Guild {
    guildName:String,
    guildID:String,
    roleID?:String,
    guildAvater?:String,
    guildMemberCount:Number,
    isPartnered:Boolean,
    validMembers: Array<String>,
    status:Boolean
  }
const guildSchema=new mongoose.Schema<Guild>({
    guildName:{type:String,required:true},
    guildID:{type:String,required:true},
    roleID:{type:String},
    guildAvater:{type:String,default:''},
    guildMemberCount:{type:Number},
    isPartnered:{type:Boolean},
    validMembers:[{type:String,maxlength:200}],
    status:{type:Boolean,required:true}
});

const GuildModel = mongoose.model<Guild>('Guild',guildSchema);

export {GuildModel};