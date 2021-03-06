import express,{Response,NextFunction} from 'express';
import { GuildModel } from '../database/guild';
import {  MessageModel } from '../database/message';
const Router:express.Router = express.Router();
import {start,client} from '../bot/botStart';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/authentication';
import { CustomError } from '../classes/error';
import {CustomRequest} from '../middleware/parametercheck'
import {Guild,MessageEmbed} from 'discord.js'
import {Role,Member,Channel} from '../interface and enum/discord';
import {Message,MessageType,MessageStatus} from "../interface and enum/schema";
//get a single message
//required headers [id,accesstoken,refreshtoken]
//required query [mid]
//used AUTHENTICATE middleware see those middleware for full info
Router.get('/', authenticate, async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const messageId = req.query.mid;
        if(!messageId)return next(new CustomError('missing query [mid]', 400)); 
        const message = await MessageModel.findOne({ messageId: messageId },'-_id')
        if (!message) return next(new CustomError('missing body [mid]', 400));
        res.status(200).json({ message: message, accesstoken: req.accesstoken, refreshtoken: req.refreshtoken })
    } catch (error) {
        console.log(error);
        next(error);
    }
});


//post a message
//required headers [id,accesstoken,refreshtoken]
//required body [selectedMembers,selectedRoles,selectedChannels,selectedTime,message,title,type,did,gid]
//used AUTHENTICATE middleware see those middleware for full info
Router.post('/',authenticate, async (req:CustomRequest, res:Response,next:NextFunction) => {
    try {
        const selectedMembers:Array<string> = req.body.selectedMembers;
        const selectedRoles:Array<string> = req.body.selectedRoles;
        const selectedChannels:Array<string> = req.body.selectedChannels;
        if(!req.body.selectedTime)return next(new CustomError('missing body [selectedTime]',400));
        const selectedTime:Date = new Date(req.body.selectedTime);
        const preview:Boolean = req.body.preview||false;
        const title:String = req.body.title||new String("");
        const message:String|undefined = req.body.message;
        const type:string = req.body.type;
        if(!type)return next(new CustomError('missing body [type?:[\'dm\' or \'channel\']]',400));
        if(type!==MessageType.CHANNEL.toString() && type!==MessageType.DM.toString())return next(new CustomError('Unsupported message type',400));
        if(!message)return next(new CustomError('required message',400));
        const discordId = req.body.did;
        const guildId = req.body.gid;
        if(!discordId)return next(new CustomError('missing body [did]',400));
        if(!guildId)return next(new CustomError('missing body [gid]',400));
        const guildData = await GuildModel.findOne({ status: true, validMembers :{$in: discordId}});
        if(!guildData) return next(new CustomError('you dont have access to this guild',403));
        if (!client) await start();
        const guildCache = client.guilds.cache.find((e) => e.id === guildId);
        const guild:Guild|undefined=await guildCache?.fetch();
        if(!guild)return next(new CustomError('could not the guild',404));

        if (selectedChannels.length === 0 && selectedRoles.length === 0 && selectedMembers.length === 0)return next(new CustomError('empty fields detected',400));
        const uid = uuidv4();
        const messageData = new MessageModel({
            messageId: uid,
            type:type,
            message:message,
            title:title,
            status:MessageStatus.PROCESSING,
            createTime:new Date(),
            favourite:false,
            delivertime:selectedTime,
            targetGuild:guild.id,
            sender:discordId
        });
        if(type===MessageType.CHANNEL){
            const channels:Array<string>=[];
            guild.channels.cache.forEach(c => {
                if (c.type === 'GUILD_TEXT' && selectedChannels.includes(c.id))
                    channels.push(c.id)
            });
            messageData.channels=channels;
            const roles: Array<string> = [];
            guild.roles.cache.forEach(r => {
                if (selectedRoles.includes(r.id))
                    roles.push(r.id)
            });
            messageData.roles=roles;
        }
        messageData.members=selectedMembers;
        await messageData.save();
        // if (preview) {
        //     const user = await client.users.fetch(discordId)
        //     const embeded:MessageEmbed = new MessageEmbed();
        //     embeded.setTitle(title.toString())
        //     embeded.addField('Message Body:', message.toString())
        //     embeded.setColor('BLURPLE');
        //     embeded.setFooter({text:`message sent by ${user.username}`})
        //     // const row = new Discord.MessageActionRow()
        //     //     .addComponents(
        //     //         new Discord.MessageButton()
        //     //             .setCustomId('primary')
        //     //             .setLabel('CANCEL')
        //     //             .setStyle('PRIMARY'),
        //     //     );
        //     await user.send({ content: 'PREVIEW', embeds: [embeded] });
        // }
        return res.sendStatus(200);
    } catch (error) {
        console.log(error);
        next(error);
    }
});
//toggle favourite for a message
//required headers [id,accesstoken,refreshtoken]
//required body [mid]
//used AUTHENTICATE middleware see those middleware for full info
Router.patch('/favourite', authenticate, async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const messageId = req.body.mid;
        if(!messageId)return next(new CustomError('missing body [mid]', 400)); 
        const message = await MessageModel.findOne({ messageId: messageId })
        if (!message) return next(new CustomError('could not fild the message', 400));
        if (message.favourite)
            message.favourite = false;
        else
            message.favourite=true;
        await message.save();
        const newMessage = await MessageModel.findOne({ messageId: messageId },'-_id')
        res.status(200).json({ message: newMessage, accesstoken: req.accesstoken, refreshtoken: req.refreshtoken })
    } catch (error) {
        console.log(error);
        next(error);
    }
})
//cancel a message
//required headers [id,accesstoken,refreshtoken]
//required body [mid]
//used AUTHENTICATE middleware see those middleware for full info
Router.delete('/', authenticate, async (req: CustomRequest, res: Response, next: NextFunction) => {
    const messageId = req.body.mid;
    try {
        const messageId = req.body.mid;
        if(!messageId)return next(new CustomError('missing body [mid]', 400)); 
        const message = await MessageModel.findOne({ messageId: messageId })
        if (!message) return next(new CustomError('could not fild the message', 400));
        message.status=MessageStatus.CANCELLED;
        const data= await message.save();
        return res.status(200).json({accesstoken:req.accesstoken,refreshtoken:req.refreshtoken,message:data});
    } catch (error) {
        console.log(error);
        res.sendStatus(500)
    }
})
export default Router;