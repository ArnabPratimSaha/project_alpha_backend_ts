"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageStatus = exports.MessageType = exports.MessageModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
var MessageType;
(function (MessageType) {
    MessageType["DM"] = "dm";
    MessageType["CHANNEL"] = "channel";
})(MessageType || (MessageType = {}));
exports.MessageType = MessageType;
var MessageStatus;
(function (MessageStatus) {
    MessageStatus["PROCESSING"] = "PROCESSING";
    MessageStatus["CANCELLED"] = "CANCELLED";
    MessageStatus["SENT"] = "SENT";
})(MessageStatus || (MessageStatus = {}));
exports.MessageStatus = MessageStatus;
const messageSchema = new mongoose_1.default.Schema({
    messageId: { type: String, required: true },
    targetGuild: { type: String, required: true },
    type: { type: String, enum: Object.values(MessageType), default: MessageType.CHANNEL, required: true },
    channels: [{ type: String, maxlength: 200 }],
    members: [{ type: String, maxlength: 200 }],
    role: [{ type: String, maxlength: 200 }],
    title: { type: String },
    message: { type: String },
    sender: { type: String },
    createTime: { type: Date, default: new Date() },
    delivertime: { type: Date, default: new Date() },
    preview: { type: Boolean },
    status: { type: String, enum: [MessageStatus.SENT, MessageStatus.CANCELLED, MessageStatus.PROCESSING], default: MessageStatus.PROCESSING, required: true },
});
const MessageModel = mongoose_1.default.model('Message', messageSchema);
exports.MessageModel = MessageModel;
