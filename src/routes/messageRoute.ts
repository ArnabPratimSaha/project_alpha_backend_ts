import express,{Response,NextFunction} from 'express';
import { GuildModel } from '../database/guild';
import {  MessageModel } from '../database/message';
const Router:express.Router = express.Router();
import {start,client} from '../bot/botStart';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/authentication';
import { CustomError } from '../classes/error';
import {CustomRequest} from '../middleware/parametercheck'
import {Guild} from 'discord.js'
import {Role,Member,Channel} from '../interface and enum/discord';
import {Message,MessageType,MessageStatus} from "../interface and enum/schema";
Router.post('/message',authenticate, async (req:CustomRequest, res:Response,next:NextFunction) => {
    try {
        const selectedMembers:Array<string> = req.body.selectedMembers;
        const selectedRoles:Array<string> = req.body.selectedRoles;
        const selectedChannels:Array<string> = req.body.selectedChannels;
        const selectedTime:Date|undefined = req.body.selectedTime;
        const preview:Boolean = req.body.preview||false;
        const title:String|undefined = req.body.title;
        const message:String|undefined = req.body.message;
        const type = req.body.type;
        if(type!==MessageType.CHANNEL||type!==MessageType.DM)return next(new CustomError('Unsupported message type',400));
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

        if (selectedChannels.length === 0 && selectedRoles.length === 0 && selectedMembers.length === 0)
            return next(new CustomError('empty fields detected',400));
        const uid = uuidv4();
        const messageData = new MessageModel({
            messageId: uid,
            type:type,
            message:message,
            title:title,
            status:MessageStatus.PROCESSING,
            createTime:new Date(),
            favourite:false,
        });
        if(type===MessageType.CHANNEL){
            const channels:Array<string>=[];
            guild.channels.cache.forEach(c => {
                if (c.type === 'GUILD_TEXT' && selectedChannels.includes(c.id))
                    channels.concat(c.id)
            });
            messageData.channels=channels;
            const roles: Array<string> = [];
            guild.roles.cache.forEach(r => {
                if (selectedRoles.includes(r.id))
                    roles.concat(r.id)
            });
            messageData.roles=roles;
        }
        messageData.members=selectedMembers;
        await messageData.save();
        // if (preview) {
        //     if (!client) await start();
        //     const user = await client.users.fetch(userId)
        //     const embeded = new Discord.MessageEmbed();
        //     embeded.setTitle(title)
        //     embeded.addField('Message Body:', message)
        //     embeded.setColor('BLURPLE')
        //     embeded.setFooter(`message sent by ${user.username}`)
        //     const row = new Discord.MessageActionRow()
        //         .addComponents(
        //             new Discord.MessageButton()
        //                 .setCustomId('primary')
        //                 .setLabel('CANCEL')
        //                 .setStyle('PRIMARY'),
        //         );
        //     await user.send({ content: 'PREVIEW', embeds: [embeded] });
        // }
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500)
    }
})
// Router.delete('/', async (req, res) => {
//     const messageId = req.query.id;
//     try {
//         const response = await MessageModel.findOneAndDelete({ messageId: messageId })
//         if (!response)
//             return res.sendStatus(404);
//         else
//             return res.sendStatus(200);

//     } catch (error) {
//         console.log(error);
//         res.sendStatus(500)
//     }
// })
export default Router;