import * as dotenv from "dotenv";
dotenv.config();
import express,{ urlencoded } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import passport from 'passport';
import DiscordStrategy from 'passport-discord'
import session from 'express-session'
import bodyParser from 'body-parser';

const app:express.Application = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(passport.initialize());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(session({resave:true, secret: 'SECRET',saveUninitialized:true }));

const connectMongo = async () => {
    try {
        const response = await mongoose.connect(process.env.DATABASE || '',)
        console.log(`Successfully Connected to ${response.connection.db.databaseName}`);
    } catch (error) {
        console.log('could not connect to mongoDB ATLAS');
    }
}
connectMongo();
passport.serializeUser(function (user:any, done) {
    done(null, user);
});

passport.deserializeUser(function (id:any, done) {
    done(null, id);
});
const scopes:Array<string> = ['identify', 'email', 'guilds'];
passport.use(new DiscordStrategy.Strategy({
    clientID: process.env.CLIENTID?.toString()||'',
    clientSecret: process.env.SECRET?.toString()||'',
    callbackURL: process.env.CALLBACKURL,
    scope: scopes
},
    function (accessToken:any, refreshToken:any, profile:any, cb:any) {
        return cb(null, { userName: profile.username, discordId: profile.id, userTag: profile.discriminator, avatar: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/4.png' });
    }));
app.listen(port, () => {
    console.log(`Vivi backend listening at http://localhost:${port}`)
});
import Authentication from './routes/authentication';
import userRoute from './routes/userRoute';
import { errorHandler } from "./middleware/error";
import discordRoute from './routes/discordRoute';
import messageRoute from './routes/messageRoute';
import logRoute from './routes/logRoute';
import informationRoute from './routes/information';
app.use('/auth',Authentication );
app.use('/user', userRoute);
app.use('/discord',discordRoute);
app.use('/message',messageRoute);
app.use('/log',logRoute);
app.use('/info',informationRoute);
app.use(errorHandler);