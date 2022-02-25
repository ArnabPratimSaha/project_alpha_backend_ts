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
const Router = express_1.default.Router();
const botStart_1 = require("../bot/botStart");
const authentication_1 = require("../middleware/authentication");
const error_1 = require("../classes/error");
const link_1 = require("../database/link");
const totp_generator_1 = __importDefault(require("totp-generator"));
const discord_js_1 = require("discord.js");
//get the information about an link
//required headers [id,accesstoken,refreshtoken]
//required query [did,sid]
//used AUTHENTICATE middleware see those middleware for full info
let timeCutoff = 10; //10min
Router.get('/info', authentication_1.authenticate, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const discordId = req.query.did;
        const sessionId = req.query.sid;
        if (!discordId)
            return next(new error_1.CustomError('missing query [did]', 400));
        if (!sessionId)
            return next(new error_1.CustomError('missing query [sid]', 400));
        const link = yield link_1.LinkModel.findOne({ discordId: discordId, entryId: sessionId }, '-_id -OTP');
        if (!link)
            return next(new error_1.CustomError('no such link found', 400));
        if (!botStart_1.client)
            yield (0, botStart_1.start)();
        const user = yield botStart_1.client.users.fetch(discordId.toString());
        if (!user)
            return next(new error_1.CustomError('user not found', 404));
        if (new Date().getTime() - new Date(link.entryTime).getTime() > 1000 * 60 * timeCutoff) {
            yield link.delete();
            return next(new error_1.CustomError('link expired', 404));
        }
        return res.status(200).json({ link: link, accesstoken: req.accesstoken, refreshtoken: req.refreshtoken });
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}));
//send the OTP to discord sever
//required headers [id,accesstoken,refreshtoken]
//required body [did,sid]
//used AUTHENTICATE middleware see those middleware for full info
Router.put('/sendcode', authentication_1.authenticate, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const discordId = req.body.did;
        const sessionId = req.body.sid;
        if (!discordId)
            return next(new error_1.CustomError('missing query [did]', 400));
        if (!sessionId)
            return next(new error_1.CustomError('missing query [sid]', 400));
        const link = yield link_1.LinkModel.findOne({ discordId: discordId, entryId: sessionId });
        if (!link)
            return next(new error_1.CustomError('no such link found', 400));
        if (!botStart_1.client)
            yield (0, botStart_1.start)();
        const user = yield botStart_1.client.users.fetch(discordId);
        if (!user)
            return next(new error_1.CustomError('user not found', 404));
        if (new Date().getTime() - new Date(link.entryTime).getTime() > 1000 * 60 * timeCutoff) {
            yield link.delete();
            return next(new error_1.CustomError('link expired', 404));
        }
        if (link.OTP)
            return res.status(200).json({ link: link, accesstoken: req.accesstoken, refreshtoken: req.refreshtoken });
        const otp = (0, totp_generator_1.default)("JBSWY3DPEHPK3PXP", { digits: 8 });
        link.OTP = otp.toString();
        const embededMessage = new discord_js_1.MessageEmbed();
        embededMessage.setTitle('OPT');
        embededMessage.setDescription(otp.toString());
        embededMessage.setFooter({ text: `Created By VIVI` });
        embededMessage.setTimestamp(new Date());
        embededMessage.setColor('GREEN');
        yield user.send({ content: 'Code generated', embeds: [embededMessage] });
        yield link.save();
        res.sendStatus(200);
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}));
//send the OTP to discord sever
//required headers [id,accesstoken,refreshtoken]
//required body [did,sid,code]
//used AUTHENTICATE middleware see those middleware for full info
Router.get('/validate', authentication_1.authenticate, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const discordId = req.query.did;
        const sessionId = req.query.sid;
        const code = req.query.code;
        if (!discordId)
            return next(new error_1.CustomError('missing query [did]', 400));
        if (!sessionId)
            return next(new error_1.CustomError('missing query [sid]', 400));
        if (!code)
            return next(new error_1.CustomError('missing query [code]', 400));
        const link = yield link_1.LinkModel.findOne({ discordId: discordId, entryId: sessionId });
        if (!link)
            return next(new error_1.CustomError('no such link found', 400));
        if (code === link.OTP) {
            yield link.delete();
            return res.status(200).json('code matched');
        }
        return next(new error_1.CustomError('invalid code', 400));
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}));
exports.default = Router;
