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
import { LogStatus, MessageStatus, MessageType } from '../interface and enum/schema';
import { LinkModel } from '../database/link';
import totp from 'totp-generator';
import {MessageEmbed} from 'discord.js';
//get the information about an link
//required headers [id,accesstoken,refreshtoken]
//required query [did,sid]
//used AUTHENTICATE middleware see those middleware for full info
let timeCutoff = 10;//10min
Router.get('/info',authenticate, async (req:CustomRequest, res:Response,next:NextFunction) => {
    try {
        const discordId = req.query.did;
        const sessionId = req.query.sid;
        if(!discordId)return next(new CustomError('missing query [did]',400));
        if(!sessionId)return next(new CustomError('missing query [sid]',400));
        const link = await LinkModel.findOne({ discordId: discordId, entryId: sessionId },'-_id -OTP')
        if (!link)  return next(new CustomError('no such link found',400));
        if (!client) await start();
        const user = await client.users.fetch(discordId.toString());
        if(!user)return next(new CustomError('user not found',404));
        if (new Date().getTime() - new Date(link.entryTime).getTime() > 1000 * 60 * timeCutoff){
            await link.delete()
            return next(new CustomError('link expired',404));
        }
        return res.status(200).json({link:link,accesstoken:req.accesstoken,refreshtoken:req.refreshtoken});
    } catch (error) {
        console.log(error);
        next(error);
    }
});
//send the OTP to discord sever
//required headers [id,accesstoken,refreshtoken]
//required body [did,sid]
//used AUTHENTICATE middleware see those middleware for full info
Router.put('/sendcode',authenticate, async (req:CustomRequest, res:Response,next:NextFunction) => {
    try {
        const discordId = req.body.did;
        const sessionId = req.body.sid;
        if(!discordId)return next(new CustomError('missing query [did]',400));
        if(!sessionId)return next(new CustomError('missing query [sid]',400));
        const link = await LinkModel.findOne({ discordId: discordId, entryId: sessionId })
        if (!link)  return next(new CustomError('no such link found',400));
        if (!client) await start();
        const user = await client.users.fetch(discordId);
        if(!user)return next(new CustomError('user not found',404));
        if (new Date().getTime() - new Date(link.entryTime).getTime() > 1000 * 60 * timeCutoff){
            await link.delete()
            return next(new CustomError('link expired',404));
        }
        if(link.OTP)return res.status(200).json({link:link,accesstoken:req.accesstoken,refreshtoken:req.refreshtoken});
        const otp = totp("JBSWY3DPEHPK3PXP", { digits: 8 });
        link.OTP = otp.toString();
        const embededMessage = new MessageEmbed();
        embededMessage.setTitle('OPT')
        embededMessage.setDescription(otp.toString());
        embededMessage.setFooter({text:`Created By VIVI`});
        embededMessage.setTimestamp(new Date());
        embededMessage.setColor('GREEN')
        await user.send({ content: 'Code generated', embeds: [embededMessage] });
        await link.save();
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        next(error);
    }
})
//send the OTP to discord sever
//required headers [id,accesstoken,refreshtoken]
//required body [did,sid,code]
//used AUTHENTICATE middleware see those middleware for full info
Router.get('/validate',authenticate, async (req:CustomRequest, res:Response,next:NextFunction) => {
    try {
        const discordId = req.query.did;
        const sessionId = req.query.sid;
        const code=  req.query.code;
        if(!discordId)return next(new CustomError('missing query [did]',400));
        if(!sessionId)return next(new CustomError('missing query [sid]',400));
        if(!code)return next(new CustomError('missing query [code]',400));
        const link = await LinkModel.findOne({ discordId: discordId, entryId: sessionId })
        if (!link)  return next(new CustomError('no such link found',400));
        if(code===link.OTP)
        {
            await link.delete()
            return res.status(200).json('code matched');
        }
        return next(new CustomError('invalid code',400));
    } catch (error) {
        console.log(error);
        next(error);
    }

})
export default Router