"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    userName: { type: String, required: true },
    userTag: { type: String, required: true },
    userId: { type: String, required: true, unique: true },
    discordId: { type: String, required: true },
    refreshtoken: [{ type: String }],
    avatar: { type: String },
});
const UserModel = mongoose_1.default.model('User', userSchema);
exports.UserModel = UserModel;
