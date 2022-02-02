import {Response,Request,NextFunction,ErrorRequestHandler} from 'express';
import { CustomError } from '../classes/error';

const errorHandler = (err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction) => {
    console.log(err);
    if (res.headersSent) {
        return next(err);
    }
    if (err instanceof CustomError) {
        return res.status(+err.code).json(`${err.clientSendable ? err.message : 'unknown error'}`);
    }
    return res.status(500).json('server error')
}
export { errorHandler }