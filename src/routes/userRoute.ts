import express,{Request,Response,Express} from 'express';
const Router:express.Router = express.Router();
import { UserModel } from '../database/user';
import { authenticate } from '../middleware/authentication';
import {CustomRequest} from '../middleware/parametercheck'
//fetch the data of the requesting user from database
//required headers [id,accesstoken,refreshtoken]
//used [authenticate] middleware
Router.get('/info',authenticate, async(req:CustomRequest,res:Response)=>{
    const userId=req.headers.id;
    try {
        const response=await UserModel.findOne({userId:userId},'-_id -refreshtoken');
        if(!response)return res.status(404).json('user not found');
        res.status(200).json({...response.toObject() ,accesstoken:req.accesstoken,refreshtoken:req.refreshtoken})
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})
//log out the user
//required headers [id,accesstoken,refreshtoken]
//used [authenticate] middleware
Router.delete('/logout',authenticate,async(req:CustomRequest,res:Response)=>{
    try {
        const userId=req.headers.id;
        const user=await UserModel.findOne({userId:userId});
        if(!user)return res.status(404).json('user not found');
        user.refreshtoken=user.refreshtoken.filter(t=>t!==req.refreshtoken);
        await user.save();
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

export default Router;