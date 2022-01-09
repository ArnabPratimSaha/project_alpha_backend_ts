"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const guild_1 = require("../database/guild");
const Router = express_1.default.Router();
const botStart_1 = require("../bot/botStart");
const authentication_1 = require("../middleware/authentication");
const error_1 = require("../classes/error");
//get all the guilds with the permission to write message
//required headers [id,accesstoken,refreshtoken]
//required query [did]
//used AUTHENTICATE middleware see those middleware for full info
Router.get('/guilds', authentication_1.authenticate, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const discordId = req.query.did;
    try {
        if (!discordId)
            return next(new error_1.CustomError('missing query [did]', 400));
        const validguilds = yield guild_1.GuildModel.find({ status: true, validMembers: { $in: discordId } }, '-_id -validMembers -isPartnered');
        return res.status(200).json({ guilds: validguilds, accesstoken: req.accesstoken, refreshtoken: req.refreshtoken });
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}));
//get all the channels of the guild
//required headers [id,accesstoken,refreshtoken]
//required body [did,gid]
//used AUTHENTICATE middleware see those middleware for full info
Router.post('/channel', authentication_1.authenticate, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const discordId = req.body.did;
        const guildId = req.body.gid;
        if (!discordId)
            return next(new error_1.CustomError('missing body [did]', 400));
        if (!guildId)
            return next(new error_1.CustomError('missing body [gid]', 400));
        const guildData = yield guild_1.GuildModel.findOne({ status: true, validMembers: { $in: discordId } });
        if (!guildData)
            return next(new error_1.CustomError('you dont have access to this guild', 403));
        if (!botStart_1.client)
            yield (0, botStart_1.start)();
        const guildCache = botStart_1.client.guilds.cache.find((e) => e.id === guildId);
        const guild = yield (guildCache === null || guildCache === void 0 ? void 0 : guildCache.fetch());
        if (!guild)
            return next(new error_1.CustomError('could not the guild', 404));
        let validChannels = [];
        guild.channels.cache.forEach((channel) => {
            if (channel.type === 'GUILD_TEXT')
                validChannels.push({ channelName: channel.name, channelId: channel.id });
        });
        res.status(200).json({ channels: validChannels, accesstoken: req.accesstoken, refreshtoken: req.refreshtoken });
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}));
Router.post('/role', authentication_1.authenticate, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const discordId = req.body.did;
        const guildId = req.body.gid;
        if (!discordId)
            return next(new error_1.CustomError('missing body [did]', 400));
        if (!guildId)
            return next(new error_1.CustomError('missing body [gid]', 400));
        const guildData = yield guild_1.GuildModel.findOne({ status: true, validMembers: { $in: discordId } });
        if (!guildData)
            return next(new error_1.CustomError('you dont have access to this guild', 403));
        if (!botStart_1.client)
            yield (0, botStart_1.start)();
        const guildCache = botStart_1.client.guilds.cache.find((e) => e.id === guildId);
        const guild = yield (guildCache === null || guildCache === void 0 ? void 0 : guildCache.fetch());
        if (!guild)
            return next(new error_1.CustomError('could not the guild', 404));
        let validRoles = guild.roles.cache.map(r => {
            return {
                name: r.name,
                id: r.id,
                color: r.hexColor,
                isAdmin: r.permissions.has('ADMINISTRATOR')
            };
        });
        res.status(200).json({ role: validRoles, accesstoken: req.accesstoken, responsetoken: req.refreshtoken });
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
Router.post('/member', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const discordId = req.body.did;
        const guildId = req.body.gid;
        const query = req.body.query;
        if (!discordId)
            return next(new error_1.CustomError('missing body [did]', 400));
        if (!guildId)
            return next(new error_1.CustomError('missing body [gid]', 400));
        if (!query)
            return next(new error_1.CustomError('missing body [query]', 400));
        const guildData = yield guild_1.GuildModel.findOne({ status: true, validMembers: { $in: discordId } });
        if (!guildData)
            return next(new error_1.CustomError('you dont have access to this guild', 403));
        if (!botStart_1.client)
            yield (0, botStart_1.start)();
        const guildCache = botStart_1.client.guilds.cache.find((e) => e.id === guildId);
        const guild = yield (guildCache === null || guildCache === void 0 ? void 0 : guildCache.fetch());
        if (!guild)
            return next(new error_1.CustomError('could not the guild', 404));
        const discordMembers = yield guild.members.fetch({ query: query.toString(), limit: 20 });
        const member = discordMembers.map(m => {
            let validRoles = m.roles.cache.map(r => {
                return {
                    name: r.name,
                    id: r.id,
                    color: r.hexColor,
                    isAdmin: r.permissions.has('ADMINISTRATOR')
                };
            });
            return {
                nickName: m.nickname,
                name: m.user.username,
                avatar: m.displayAvatarURL(),
                tag: m.user.discriminator,
                isAdmin: m.permissions.has('ADMINISTRATOR'),
                roles: validRoles,
                id: m.id
            };
        });
        return res.status(200).json({ members: member, accesstoken: req.accesstoken, refreshtoken: req.refreshtoken });
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
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
exports.default = Router;
