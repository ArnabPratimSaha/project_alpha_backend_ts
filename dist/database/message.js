"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageStatus = exports.MessageType = exports.MessageModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const schema_1 = require("../interface and enum/schema");
Object.defineProperty(exports, "MessageStatus", { enumerable: true, get: function () { return schema_1.MessageStatus; } });
Object.defineProperty(exports, "MessageType", { enumerable: true, get: function () { return schema_1.MessageType; } });
const messageSchema = new mongoose_1.default.Schema({
    messageId: { type: String, required: true },
    targetGuild: { type: String, required: true },
    type: { type: String, enum: ['channel', 'dm'], default: schema_1.MessageType.CHANNEL, required: true },
    channels: [{ type: String, maxlength: 200 }],
    members: [{ type: String, maxlength: 200 }],
    roles: [{ type: String, maxlength: 200 }],
    title: { type: String, required: true },
    message: { type: String, required: true },
    sender: { type: String, required: true },
    createTime: { type: Date, default: new Date(), required: true },
    delivertime: { type: Date, default: new Date(), required: true },
    preview: { type: Boolean },
    status: { type: String, enum: [schema_1.MessageStatus.SENT, schema_1.MessageStatus.CANCELLED, schema_1.MessageStatus.PROCESSING], default: schema_1.MessageStatus.PROCESSING, required: true },
    favourite: { type: Boolean, default: false }
});
const MessageModel = mongoose_1.default.model('Message', messageSchema);
exports.MessageModel = MessageModel;
