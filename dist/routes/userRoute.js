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
const user_1 = require("../database/user");
const authentication_1 = require("../middleware/authentication");
//fetch the data of the requesting user from database
//required headers [id,accesstoken,refreshtoken]
//used [authenticate] middleware
Router.get('/info', authentication_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.headers.id;
    try {
        const response = yield user_1.UserModel.findOne({ userId: userId }, '-_id -refreshtoken');
        if (!response)
            return res.status(404).json('user not found');
        res.status(200).json(Object.assign(Object.assign({}, response.toObject()), { accesstoken: req.accesstoken, refreshtoken: req.refreshtoken }));
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
//log out the user
//required headers [id,accesstoken,refreshtoken]
//used [authenticate] middleware
Router.delete('/logout', authentication_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.headers.id;
        const user = yield user_1.UserModel.findOne({ userId: userId });
        if (!user)
            return res.status(404).json('user not found');
        user.refreshtoken = user.refreshtoken.filter(t => t !== req.refreshtoken);
        yield user.save();
        res.sendStatus(200);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
exports.default = Router;
