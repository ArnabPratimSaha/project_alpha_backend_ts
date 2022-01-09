import express,{Request,Response,Express} from 'express';
const Router:express.Router = express.Router();
import passport from 'passport';
import { UserModel } from '../database/user';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

Router.get('/discord', passport.authenticate('discord'));
Router.get('/discord/callback', passport.authenticate('discord', {failureRedirect: '/error'}), async(
  req:Request, res:Response
  )=> {
    try {
        if (!process.env.SECRET) throw new Error('server sidder error');
        const user:any=req.user;
        if(!user)throw new Error('could not find any requst')
        const userData=await UserModel.findOne({discordId:user.discordId});
        if(userData){
          const accesstoken = jwt.sign({ id: userData.userId }, process.env.SECRET,{ expiresIn:  60});//1 min 
          const refreshtoken=jwt.sign({ id: userData.userId }, process.env.SECRET,{expiresIn:'1y'});
          userData.refreshtoken?.push(refreshtoken);
          await userData.save();
          return res.redirect(`${process.env.FRONTENDURL}auth/${userData.userId}/${accesstoken}/${refreshtoken}`);
        }
        const newUser = new UserModel({
            userName: user.userName,
            userTag: user.userTag,
            userId: uuidv4(),
            discordId: user.discordId,
            refreshtoken:[],
            avatar: user.avatar
        });
        const accesstoken=jwt.sign({ id: newUser.userId }, process.env.SECRET,{ expiresIn: 60 });
        const refreshtoken=jwt.sign({ id: newUser.userId }, process.env.SECRET,{expiresIn:'1y'});
        newUser.refreshtoken.push(refreshtoken);
        const response=await newUser.save();
        return res.redirect(`${process.env.FRONTENDURL}auth/${response.userId}/${accesstoken}/${refreshtoken}`);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
});
export default Router;
