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
const error_1 = require("../classes/error");
const heroku_client_1 = __importDefault(require("heroku-client"));
const heroku = new heroku_client_1.default({ token: process.env.HEROKU_API_TOKEN });
//get the guilds with the bot 
Router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.query.c)
            return next(new error_1.CustomError('missing query [c]', 400));
        const count = +req.query.c;
        const allGuilds = yield guild_1.GuildModel.find({ status: true }).sort({ guildMemberCount: -1 }).limit(count);
        res.status(200).json({ guilds: allGuilds });
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}));
//get the status of the bot 
Router.get('/botstatus', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        heroku.get(`/apps/${process.env.DISCORD_BOT_PROJECT_NAME_HEROKU}/dynos/${process.env.DISCORD_BOT_PROJECT_DYNOS_HEROKU}`).then(response => {
            if (response) {
                if (response)
                    return res.status(200).json({ 'state': response.state }); //current status of process (either: crashed, down, idle, starting, or up)
                return next(new error_1.CustomError('bot servive unavailable', 503)); //service unavilable
            }
        }).catch((err) => {
            return next(new error_1.CustomError('bot servive unavailable', 503)); //service unaviable
        });
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}));
exports.default = Router;
