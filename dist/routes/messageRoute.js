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
const message_1 = require("../database/message");
const Router = express_1.default.Router();
const botStart_1 = require("../bot/botStart");
const uuid_1 = require("uuid");
const authentication_1 = require("../middleware/authentication");
const error_1 = require("../classes/error");
const schema_1 = require("../interface and enum/schema");
//get a single message
//required headers [id,accesstoken,refreshtoken]
//required query [mid]
//used AUTHENTICATE middleware see those middleware for full info
Router.get('/', authentication_1.authenticate, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const messageId = req.query.mid;
        if (!messageId)
            return next(new error_1.CustomError('missing query [mid]', 400));
        const message = yield message_1.MessageModel.findOne({ messageId: messageId }, '-_id');
        if (!message)
            return next(new error_1.CustomError('missing body [mid]', 400));
        res.status(200).json({ message: message, accesstoken: req.accesstoken, refreshtoken: req.refreshtoken });
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}));
//post a message
//required headers [id,accesstoken,refreshtoken]
//required body [selectedMembers,selectedRoles,selectedChannels,selectedTime,message,title,type,did,gid]
//used AUTHENTICATE middleware see those middleware for full info
Router.post('/', authentication_1.authenticate, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const selectedMembers = req.body.selectedMembers;
        const selectedRoles = req.body.selectedRoles;
        const selectedChannels = req.body.selectedChannels;
        if (!req.body.selectedTime)
            return next(new error_1.CustomError('missing body [selectedTime]', 400));
        const selectedTime = new Date(req.body.selectedTime);
        const preview = req.body.preview || false;
        const title = req.body.title || new String("");
        const message = req.body.message;
        const type = req.body.type;
        if (!type)
            return next(new error_1.CustomError('missing body [type?:[\'dm\' or \'channel\']]', 400));
        if (type !== schema_1.MessageType.CHANNEL.toString() && type !== schema_1.MessageType.DM.toString())
            return next(new error_1.CustomError('Unsupported message type', 400));
        if (!message)
            return next(new error_1.CustomError('required message', 400));
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
        if (selectedChannels.length === 0 && selectedRoles.length === 0 && selectedMembers.length === 0)
            return next(new error_1.CustomError('empty fields detected', 400));
        const uid = (0, uuid_1.v4)();
        const messageData = new message_1.MessageModel({
            messageId: uid,
            type: type,
            message: message,
            title: title,
            status: schema_1.MessageStatus.PROCESSING,
            createTime: new Date(),
            favourite: false,
            delivertime: selectedTime,
            targetGuild: guild.id,
            sender: discordId
        });
        if (type === schema_1.MessageType.CHANNEL) {
            const channels = [];
            guild.channels.cache.forEach(c => {
                if (c.type === 'GUILD_TEXT' && selectedChannels.includes(c.id))
                    channels.push(c.id);
            });
            messageData.channels = channels;
            const roles = [];
            guild.roles.cache.forEach(r => {
                if (selectedRoles.includes(r.id))
                    roles.push(r.id);
            });
            messageData.roles = roles;
        }
        messageData.members = selectedMembers;
        yield messageData.save();
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
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}));
//toggle favourite for a message
//required headers [id,accesstoken,refreshtoken]
//required body [mid]
//used AUTHENTICATE middleware see those middleware for full info
Router.patch('/favourite', authentication_1.authenticate, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const messageId = req.body.mid;
        if (!messageId)
            return next(new error_1.CustomError('missing body [mid]', 400));
        const message = yield message_1.MessageModel.findOne({ messageId: messageId });
        if (!message)
            return next(new error_1.CustomError('could not fild the message', 400));
        if (message.favourite)
            message.favourite = false;
        else
            message.favourite = true;
        yield message.save();
        const newMessage = yield message_1.MessageModel.findOne({ messageId: messageId }, '-_id');
        res.status(200).json({ message: newMessage, accesstoken: req.accesstoken, refreshtoken: req.refreshtoken });
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}));
//cancel a message
//required headers [id,accesstoken,refreshtoken]
//required body [mid]
//used AUTHENTICATE middleware see those middleware for full info
Router.delete('/', authentication_1.authenticate, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const messageId = req.body.mid;
    try {
        const messageId = req.body.mid;
        if (!messageId)
            return next(new error_1.CustomError('missing body [mid]', 400));
        const message = yield message_1.MessageModel.findOne({ messageId: messageId });
        if (!message)
            return next(new error_1.CustomError('could not fild the message', 400));
        message.status = schema_1.MessageStatus.CANCELLED;
        const data = yield message.save();
        return res.status(200).json({ accesstoken: req.accesstoken, refreshtoken: req.refreshtoken, message: data });
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
exports.default = Router;
