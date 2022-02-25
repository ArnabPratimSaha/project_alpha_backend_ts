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
const message_1 = require("../database/message");
const Router = express_1.default.Router();
const botStart_1 = require("../bot/botStart");
const authentication_1 = require("../middleware/authentication");
const error_1 = require("../classes/error");
const schema_1 = require("../interface and enum/schema");
//get query messages
//required headers [id,accesstoken,refreshtoken]
//required query [limit,status,page,did,fav]
//used AUTHENTICATE middleware see those middleware for full info
Router.get('/', authentication_1.authenticate, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.query.limit)
            return next(new error_1.CustomError('missing query [limit]', 400));
        if (!req.query.page)
            return next(new error_1.CustomError('missing query [page]', 400));
        if (!req.query.status)
            return next(new error_1.CustomError('missing query [status]', 400));
        const limit = +req.query.limit;
        const page = +req.query.page;
        const discordId = req.query.did;
        if (!discordId)
            return next(new error_1.CustomError('missing query [did]', 400));
        const status = req.query.status || 'ALL';
        const messageType = req.query.type ? req.query.type.toString() : 'any';
        const startIndex = (page - 1) * limit;
        const endIndex = limit * page;
        const favourite = req.query.fav === 'true' ? true : false;
        const query = req.query.query ? req.query.query.toString().trim() : '';
        const typeArray = [];
        const statusArray = [];
        if (status === 'ALL') {
            statusArray.push(schema_1.MessageStatus.CANCELLED.toString());
            statusArray.push(schema_1.MessageStatus.PROCESSING.toString());
            statusArray.push(schema_1.MessageStatus.SENT.toString());
        }
        else {
            statusArray.push(status.toString());
        }
        if (messageType !== 'any') {
            typeArray.push(messageType);
        }
        else {
            typeArray.push(schema_1.MessageType.DM.toString());
            typeArray.push(schema_1.MessageType.CHANNEL.toString());
        }
        const favouriteArray = [];
        if (favourite) {
            favouriteArray.push(true);
        }
        else {
            favouriteArray.push(true);
            favouriteArray.push(false);
        }
        let messageData = [];
        let regex = query ? new RegExp(`${query}`, 'g') : new RegExp('', 'g');
        messageData = yield message_1.MessageModel.find({
            sender: discordId,
            type: { $in: typeArray },
            status: { $in: statusArray },
            favourite: { $in: favouriteArray },
            title: { $regex: regex }
        }, '-_id').sort({ createTime: -1 }).limit(endIndex).skip(startIndex);
        if (!botStart_1.client)
            yield (0, botStart_1.start)();
        const logData = messageData.map(m => {
            const guild = botStart_1.client.guilds.cache.find(g => g.id === m.targetGuild);
            const guildData = {
                icon: guild === null || guild === void 0 ? void 0 : guild.iconURL(),
                name: guild === null || guild === void 0 ? void 0 : guild.name
            };
            return { message: m, guildData: guildData };
        });
        return res.status(200).json({ log: logData, accesstoken: req.accesstoken, refreshtoken: req.refreshtoken });
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}));
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
exports.default = Router;
