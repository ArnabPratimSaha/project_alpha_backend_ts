"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const error_1 = require("../classes/error");
const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    if (err instanceof error_1.CustomError) {
        return res.status(+err.code).json(`${err.clientSendable ? err.message : 'unknown error'}`);
    }
    console.log(err);
    return res.status(500).json('server error');
};
exports.errorHandler = errorHandler;
