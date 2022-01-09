"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const guildSchema = new mongoose_1.default.Schema({
    guildName: { type: String, required: true },
    guildID: { type: String, required: true },
    roleID: { type: String },
    guildAvater: { type: String, default: '' },
    guildMemberCount: { type: Number },
    isPartnered: { type: Boolean },
    validMembers: [{ type: String, maxlength: 200 }],
    status: { type: Boolean, required: true }
});
const GuildModel = mongoose_1.default.model('Guild', guildSchema);
exports.GuildModel = GuildModel;
