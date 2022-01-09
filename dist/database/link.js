"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const linkSchema = new mongoose_1.default.Schema({
    discordId: { type: String, required: true },
    entryId: { type: String, required: true },
    entryTime: { type: Date, required: true, default: new Date() },
    OTP: { type: String }
});
const LinkModel = mongoose_1.default.model('Link', linkSchema);
exports.LinkModel = LinkModel;
