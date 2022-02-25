
import express, { Response, NextFunction } from 'express';
import { GuildModel } from '../database/guild';
import { MessageModel } from '../database/message';
const Router: express.Router = express.Router();
import { start, client } from '../bot/botStart';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/authentication';
import { CustomError } from '../classes/error';
import { CustomRequest } from '../middleware/parametercheck'
import { Guild } from 'discord.js'
import { Channel, Role, Member } from '../interface and enum/discord';
import mongoose from 'mongoose';
import { LogStatus, Message, MessageStatus, MessageType } from '../interface and enum/schema';
interface logInterface extends Message{
    guildData?:{ name:string,id:string,avatar?:string }
}
//get query messages
//required headers [id,accesstoken,refreshtoken]
//required query [limit,status,page,did,fav]
//used AUTHENTICATE middleware see those middleware for full info
Router.get('/', authenticate, async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.query.limit) return next(new CustomError('missing query [limit]', 400));
        if (!req.query.page) return next(new CustomError('missing query [page]', 400));
        if (!req.query.status) return next(new CustomError('missing query [status]', 400));
        const limit: number = +req.query.limit;
        const page: number = +req.query.page;
        const discordId = req.query.did;
        if (!discordId) return next(new CustomError('missing query [did]', 400));
        const status = req.query.status || 'ALL';
        const messageType:string = req.query.type?req.query.type.toString():'any'
        const startIndex = (page - 1) * limit;
        const endIndex = limit * page;
        const favourite:boolean= req.query.fav==='true'?true:false;
        const query = req.query.query ? req.query.query.toString().trim() : '';
        const typeArray: Array<string> = [];
        const statusArray: Array<string> = [];
        if (status === 'ALL') {
            statusArray.push(MessageStatus.CANCELLED.toString())
            statusArray.push(MessageStatus.PROCESSING.toString())
            statusArray.push(MessageStatus.SENT.toString())
        } else {
            statusArray.push(status.toString());
        }
        if (messageType !== 'any') {
            typeArray.push(messageType)
        } else {
            typeArray.push(MessageType.DM.toString())
            typeArray.push(MessageType.CHANNEL.toString())
        }
        const favouriteArray:Array<boolean>=[];
        if (favourite) {
            favouriteArray.push(true)
        } else {
            favouriteArray.push(true)
            favouriteArray.push(false)
        }
        let messageData:Array<Message>=[];
        let regex=query?new RegExp(`${query}`,'g'):new RegExp('','g');
        messageData = await MessageModel.find({
            sender: discordId,
            type: { $in: typeArray },
            status: { $in: statusArray },
            favourite: { $in : favouriteArray },
            title:{ $regex :regex }
        },'-_id').sort({ createTime: -1 }).limit(endIndex).skip(startIndex)
        if (!client) await start();
        const logData=messageData.map(m=>{
            const guild=client.guilds.cache.find(g=>g.id===m.targetGuild);
            const guildData={
                icon:guild?.iconURL(),
                name:guild?.name
            };
            return {message:m,guildData:guildData}
        })
        return res.status(200).json({ log: logData, accesstoken: req.accesstoken, refreshtoken: req.refreshtoken })
    } catch (error) {
        console.log(error);
        next(error);
    }
});


// Router.patch('/status',async(req,res)=>{
//     const messageId=req.query.id;
//     const status=req.query.status;
//     try {
//         const log=await logModel.findOne({messageId:messageId});
//         if(!log)
//             return res.sendStatus(404);
//         else
//         {
//             log.status=status;
//             await log.save();
//             res.sendStatus(200);
//         }

//     } catch (error) {
//         console.log(error);
//         res.sendStatus(500)
//     }
// })
export default Router;