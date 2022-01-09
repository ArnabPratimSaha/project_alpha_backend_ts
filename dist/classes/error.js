"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = void 0;
class CustomError extends Error {
    constructor(message, code, clientSendable) {
        super(message.toString());
        this.code = code;
        this.clientSendable = clientSendable || true;
    }
}
exports.CustomError = CustomError;
