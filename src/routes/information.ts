import express, {Request, Response, NextFunction } from 'express';
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
import Heroku from 'heroku-client';

const heroku = new Heroku({ token: process.env.HEROKU_API_TOKEN });
//get the guilds with the bot 
Router.get('/',async(req:Request,res:Response,next:NextFunction)=>{
    try {
        if (!req.query.c) return next(new CustomError('missing query [c]',400));
        const count =+req.query.c;
        const allGuilds=await GuildModel.find( { status:true } ).sort( {guildMemberCount:-1 } ).limit(count);
        res.status(200).json({guilds:allGuilds});
    } catch (error) {
        console.log(error);
        next(error);
    }
});
//get the status of the bot 
Router.get('/botstatus',async(req:Request,res:Response,next:NextFunction)=>{
    try {
       heroku.get(`/apps/${process.env.DISCORD_BOT_PROJECT_NAME_HEROKU}/dynos/${process.env.DISCORD_BOT_PROJECT_DYNOS_HEROKU}`).then(response=>{
        if(response){
            if(response)
                return res.status(200).json({'state':response.state});//current status of process (either: crashed, down, idle, starting, or up)
            return next(new CustomError('bot servive unavailable',503))//service unavilable
        }
       }).catch((err)=>{
        return  next(new CustomError('bot servive unavailable',503))//service unaviable
       })
    } catch (error) {
        console.log(error);
        next(error);
    }
})
export default Router;