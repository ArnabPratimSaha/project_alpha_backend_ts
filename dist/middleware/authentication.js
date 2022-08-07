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
exports.authenticate = void 0;
const user_1 = require("../database/user");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_1 = require("../classes/error");
//this validates the user if it is in the database or not
//takes the access token and refreshes it if necessery
//required headers [id,accesstoken,refreshtoken]
//adds [user,accesstoken,refreshtoken] to res.locals(accessed as req.locals from next middleware)
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!process.env.SECRET)
            return next(new error_1.CustomError('Could not process.env.SECRET', 500, false));
        if (!req.headers.accesstoken)
            return next(new error_1.CustomError('Could not find accesstoken', 400));
        if (!req.headers.refreshtoken)
            return next(new error_1.CustomError('Could not refreshtoken', 400));
        if (!req.headers.id)
            return next(new error_1.CustomError('Could not id', 400));
        const accesstoken = req.headers.accesstoken;
        const decoded = jsonwebtoken_1.default.verify(accesstoken.toString(), process.env.SECRET);
        if (!decoded)
            return next(new error_1.CustomError('empty accesstoken', 400));
        const user = yield user_1.UserModel.findOne({ userId: req.headers.id });
        if (!user)
            return next(new error_1.CustomError('No user found', 404));
        req.accesstoken = accesstoken.toString();
        req.refreshtoken = req.headers.refreshtoken.toString();
        req.user = user;
        next();
        return;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            //refreshing the access token
            try {
                if (!process.env.SECRET)
                    return next(new error_1.CustomError('Could not process.env.SECRET', 500, false));
                if (!req.headers.accesstoken)
                    return next(new error_1.CustomError('Could not accesstoken', 400));
                if (!req.headers.refreshtoken)
                    return next(new error_1.CustomError('Could not refreshtoken', 400));
                if (!req.headers.id)
                    return next(new error_1.CustomError('Could not id', 400));
                if (!process.env.SECRET)
                    return next(new error_1.CustomError('Could not process.env.SECRET', 500, false));
                const refreshtoken = req.headers.refreshtoken;
                const id = req.headers.id;
                const user = yield user_1.UserModel.findOne({ userId: id });
                if (!user)
                    return next(new error_1.CustomError('No user found', 404));
                if (user.refreshtoken.includes(refreshtoken.toString())) {
                    req.accesstoken = jsonwebtoken_1.default.sign({ id: user.userId }, process.env.SECRET, { expiresIn: 60 }); //1 min
                    req.user = user;
                    req.refreshtoken = req.headers.refreshtoken.toString();
                    next();
                    return;
                }
                //user does not have refresh token or have a wrong refresh token
                // user.refreshtoken = [];
                // await user.save();
                return next(new error_1.CustomError('Security breach', 401));
            }
            catch (e) {
                console.log(e);
                return next(new error_1.CustomError('unknow error', 500));
            }
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            //security breach(user used a malformed jwt)
            try {
                // const id = req.headers.id;
                // const user = await UserModel.findOne({ userId: id });
                // if (!user) return next(new CustomError('No user found',404));
                // user.refreshtoken = [];
                // await user.save();
                return next(new error_1.CustomError('Security breach', 401));
            }
            catch (e) {
                console.log(e);
                return next(new error_1.CustomError('unknow error', 500));
            }
        }
        console.log(error);
        return next(new error_1.CustomError('unknow error', 500));
    }
});
exports.authenticate = authenticate;
