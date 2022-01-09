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
const passport_1 = __importDefault(require("passport"));
const user_1 = require("../database/user");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
Router.get('/discord', passport_1.default.authenticate('discord'));
Router.get('/discord/callback', passport_1.default.authenticate('discord', { failureRedirect: '/error' }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!process.env.SECRET)
            throw new Error('server sidder error');
        const user = req.user;
        if (!user)
            throw new Error('could not find any requst');
        const userData = yield user_1.UserModel.findOne({ discordId: user.discordId });
        if (userData) {
            const accesstoken = jsonwebtoken_1.default.sign({ id: userData.userId }, process.env.SECRET, { expiresIn: 60 }); //1 min 
            const refreshtoken = jsonwebtoken_1.default.sign({ id: userData.userId }, process.env.SECRET, { expiresIn: '1y' });
            (_a = userData.refreshtoken) === null || _a === void 0 ? void 0 : _a.push(refreshtoken);
            yield userData.save();
            return res.redirect(`${process.env.FRONTENDURL}auth/${userData.userId}/${accesstoken}/${refreshtoken}`);
        }
        const newUser = new user_1.UserModel({
            userName: user.userName,
            userTag: user.userTag,
            userId: (0, uuid_1.v4)(),
            discordId: user.discordId,
            refreshtoken: [],
            avatar: user.avatar
        });
        const accesstoken = jsonwebtoken_1.default.sign({ id: newUser.userId }, process.env.SECRET, { expiresIn: 60 });
        const refreshtoken = jsonwebtoken_1.default.sign({ id: newUser.userId }, process.env.SECRET, { expiresIn: '1y' });
        newUser.refreshtoken.push(refreshtoken);
        const response = yield newUser.save();
        return res.redirect(`${process.env.FRONTENDURL}auth/${response.userId}/${accesstoken}/${refreshtoken}`);
    }
    catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}));
exports.default = Router;
