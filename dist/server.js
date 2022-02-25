"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const passport_1 = __importDefault(require("passport"));
const passport_discord_1 = __importDefault(require("passport-discord"));
const express_session_1 = __importDefault(require("express-session"));
const body_parser_1 = __importDefault(require("body-parser"));
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(passport_1.default.initialize());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.raw());
app.use((0, express_session_1.default)({ resave: true, secret: 'SECRET', saveUninitialized: true }));
const connectMongo = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield mongoose_1.default.connect(process.env.DATABASE || '');
        console.log(`Successfully Connected to ${response.connection.db.databaseName}`);
    }
    catch (error) {
        console.log('could not connect to mongoDB ATLAS');
    }
});
connectMongo();
passport_1.default.serializeUser(function (user, done) {
    done(null, user);
});
passport_1.default.deserializeUser(function (id, done) {
    done(null, id);
});
const scopes = ['identify', 'email', 'guilds'];
passport_1.default.use(new passport_discord_1.default.Strategy({
    clientID: ((_a = process.env.CLIENTID) === null || _a === void 0 ? void 0 : _a.toString()) || '',
    clientSecret: ((_b = process.env.SECRET) === null || _b === void 0 ? void 0 : _b.toString()) || '',
    callbackURL: process.env.CALLBACKURL,
    scope: scopes
}, function (accessToken, refreshToken, profile, cb) {
    return cb(null, { userName: profile.username, discordId: profile.id, userTag: profile.discriminator, avatar: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/4.png' });
}));
app.listen(port, () => {
    console.log(`Vivi backend listening at http://localhost:${port}`);
});
const authentication_1 = __importDefault(require("./routes/authentication"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const error_1 = require("./middleware/error");
const discordRoute_1 = __importDefault(require("./routes/discordRoute"));
const messageRoute_1 = __importDefault(require("./routes/messageRoute"));
const logRoute_1 = __importDefault(require("./routes/logRoute"));
const information_1 = __importDefault(require("./routes/information"));
app.use('/auth', authentication_1.default);
app.use('/user', userRoute_1.default);
app.use('/discord', discordRoute_1.default);
app.use('/message', messageRoute_1.default);
app.use('/log', logRoute_1.default);
app.use('/info', information_1.default);
app.use(error_1.errorHandler);
