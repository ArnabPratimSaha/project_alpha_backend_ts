import express,{Response,NextFunction} from 'express';
import { GuildModel } from '../database/guild';
import { MessageModel } from '../database/message';
const Router:express.Router = express.Router();
import {start,client} from '../bot/botStart';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/authentication';
import { CustomError } from '../classes/error';
import {CustomRequest} from '../middleware/parametercheck'
import {Guild} from 'discord.js'
import { Channel,Role,Member } from '../interface and enum/discord';
//get all the guilds with the permission to write message
//required headers [id,accesstoken,refreshtoken]
//required query [did]
//used AUTHENTICATE middleware see those middleware for full info
Router.get('/guilds',authenticate,async (req:CustomRequest, res:Response,next:NextFunction) => {
    const discordId = req.query.did;
    try {
        if (!discordId) return next(new CustomError('missing query [did]',400));
        const validguilds = await GuildModel.find({ status: true, validMembers :{$in: discordId}},'-_id -validMembers -isPartnered');
        return res.status(200).json({ guilds: validguilds,accesstoken:req.accesstoken,refreshtoken:req.refreshtoken })
    } catch (error) {
        console.log(error);
        next(error);
    }
});

//get all the channels of the guild
//required headers [id,accesstoken,refreshtoken]
//required body [did,gid]
//used AUTHENTICATE middleware see those middleware for full info
Router.post('/channel',authenticate, async (req:CustomRequest, res:Response,next:NextFunction) => {
    try {
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
        let validChannels:Array<Channel>=[];
        guild.channels.cache.forEach((channel)=>{
            if(channel.type==='GUILD_TEXT')validChannels.push({channelName:channel.name,channelId:channel.id});
        })
        res.status(200).json({ channels: validChannels ,accesstoken:req.accesstoken,refreshtoken:req.refreshtoken})
    } catch (error) {
        console.log(error);
        next(error);
    }
});

Router.post('/role',authenticate, async (req:CustomRequest, res:Response,next:NextFunction) => {
    try {
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
        let validRoles: Array<Role> = guild.roles.cache.map(r => {
            return {
                name:r.name,
                id:r.id,
                color:r.hexColor,
                isAdmin:r.permissions.has('ADMINISTRATOR')
            }
        })
        res.status(200).json({ role: validRoles,accesstoken:req.accesstoken,responsetoken:req.refreshtoken })
    } catch (error) {
        console.log(error);
        res.sendStatus(500)
    }
});

Router.post('/member', async (req:CustomRequest, res:Response,next:NextFunction) => {
    try {
        const discordId = req.body.did;
        const guildId = req.body.gid;
        const query = req.body.query;
        if(!discordId)return next(new CustomError('missing body [did]',400));
        if(!guildId)return next(new CustomError('missing body [gid]',400));
        if(!query)return next(new CustomError('missing body [query]',400));
        const guildData = await GuildModel.findOne({ status: true, validMembers :{$in: discordId}});
        if(!guildData) return next(new CustomError('you dont have access to this guild',403));
        if (!client) await start();
        const guildCache = client.guilds.cache.find((e) => e.id === guildId);
        const guild:Guild|undefined=await guildCache?.fetch();
        if(!guild)return next(new CustomError('could not the guild',404));
        const discordMembers = await guild.members.fetch({ query:query.toString(), limit: 20 });
        const member: Array<Member> = discordMembers.map(m => {
            let validRoles: Array<Role> = m.roles.cache.map(r => {
                return {
                    name: r.name,
                    id: r.id,
                    color: r.hexColor,
                    isAdmin: r.permissions.has('ADMINISTRATOR')
                }
            })
            return {
                nickName: m.nickname,
                name: m.user.username,
                avatar: m.displayAvatarURL(),
                tag: m.user.discriminator,
                isAdmin:m.permissions.has('ADMINISTRATOR'),
                roles:validRoles,
                id:m.id
            }
        })
        return res.status(200).json({ members: member,accesstoken:req.accesstoken,refreshtoken:req.refreshtoken })
    } catch (error) {
        console.log(error);
        res.sendStatus(500)
    }
})

// const extractChannelId = (channels) => {
//     let id = [];
//     for (let i = 0; i < channels.length; i++) {
//         const e = channels[i];
//         id.push(e.channelId)
//     }
//     return id;
// }
// const extractRoleId = (roles) => {
//     let id = [];
//     for (let i = 0; i < roles.length; i++) {
//         const e = roles[i];
//         id.push(e.roleId)
//     }
//     return id;
// }
// const extractMemberId = (members) => {
//     let id = [];
//     for (let i = 0; i < members.length; i++) {
//         const e = members[i];
//         id.push(e.memberId)
//     }
//     return id;
// }


export default Router;


