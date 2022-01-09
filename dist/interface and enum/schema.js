"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageType = exports.MessageStatus = void 0;
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
