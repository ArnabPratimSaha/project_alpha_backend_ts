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
Router.post('/', authentication_1.authenticate, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const selectedMembers = req.body.selectedMembers;
        const selectedRoles = req.body.selectedRoles;
        const selectedChannels = req.body.selectedChannels;
        if (!req.body.selectedTime)
            return next(new error_1.CustomError('missing body [selectedTime]', 400));
        const selectedTime = new Date(req.body.selectedTime);
        const preview = req.body.preview || false;
        const title = req.body.title;
        const message = req.body.message;
        const type = req.body.type;
        if (!type)
            return next(new error_1.CustomError('missing body [type?:[\'dm\' or \'channel\']]', 400));
        if (type !== schema_1.MessageType.CHANNEL.toString() && type !== schema_1.MessageType.DM.toString())
            return next(new error_1.CustomError('Unsupported message type', 400));
        if (!title)
            return next(new error_1.CustomError('required title', 400));
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
        res.sendStatus(500);
    }
}));
Router.post('/test', authentication_1.authenticate, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body.type);
}));
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
exports.default = Router;
