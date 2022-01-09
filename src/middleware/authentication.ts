
import {Request,Response,NextFunction} from 'express';
import { UserModel } from '../database/user';
import jwt from 'jsonwebtoken';
import { CustomError } from '../classes/error';
import { CustomRequest } from './parametercheck';
//this validates the user if it is in the database or not
//takes the access token and refreshes it if necessery
//required headers [id,accesstoken,refreshtoken]
//adds [user,accesstoken,refreshtoken] to res.locals(accessed as req.locals from next middleware)
const authenticate = async (req:CustomRequest, res:Response, next:NextFunction) => {
    try {
        if(!process.env.SECRET)return next(new CustomError('Could not process.env.SECRET',500,false));
        if(!req.headers.accesstoken)return next(new CustomError('Could not accesstoken',400));
        if(!req.headers.refreshtoken)return next(new CustomError('Could not refreshtoken',400));
        if(!req.headers.id)return next(new CustomError('Could not id',400));
        const accesstoken = req.headers.accesstoken;
        const decoded:any = jwt.verify(accesstoken.toString(), process.env.SECRET);
        if(!decoded) return next(new CustomError('empty accesstoken',400))
        const user = await UserModel.findOne({ userId: req.headers.id });
        if (!user) return next(new CustomError('No user found',404));
        req.accesstoken = accesstoken.toString();
        req.refreshtoken = req.headers.refreshtoken.toString();
        req.user = user;
        next();
        return;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {            
            //refreshing the access token
            try {
                if (!process.env.SECRET) return next(new CustomError('Could not process.env.SECRET', 500, false));
                if (!req.headers.accesstoken) return next(new CustomError('Could not accesstoken', 400));
                if (!req.headers.refreshtoken) return next(new CustomError('Could not refreshtoken', 400));
                if (!req.headers.id) return next(new CustomError('Could not id', 400));
                if(!process.env.SECRET)return next(new CustomError('Could not process.env.SECRET',500,false));
                const refreshtoken = req.headers.refreshtoken;
                const id = req.headers.id;
                const user = await UserModel.findOne({ userId: id });
                if (!user) return next(new CustomError('No user found',404));
                if (user.refreshtoken.includes(refreshtoken.toString())) {
                    req.accesstoken = jwt.sign({ id: user.userId }, process.env.SECRET, { expiresIn: 60 });//1 min
                    req.user = user;
                    req.refreshtoken = req.headers.refreshtoken.toString();
                    next();
                    return;
                }
                //user does not have refresh token or have a wrong refresh token
                user.refreshtoken = [];
                await user.save();
                return next(new CustomError('Security breach',401));
            } catch (e) {
                console.log(e);
                return next(new CustomError('unknow error',500));
            }
        }
        if (error instanceof jwt.JsonWebTokenError) {
            //security breach(user used a malformed jwt)
            try {
                const id = req.headers.id;
                const user = await UserModel.findOne({ userId: id });
                if (!user) return next(new CustomError('No user found',404));
                user.refreshtoken = [];
                await user.save();
                return next(new CustomError('Security breach',401));
            } catch (e) {
                console.log(e);
                return next(new CustomError('unknow error',500));
            }
        }
        console.log(error);
        return next(new CustomError('unknow error',500));
    }
}
export  { authenticate };