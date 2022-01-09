import { Request, Response, NextFunction } from 'express'
interface CustomRequest extends Request {
    accesstoken?: String,
    refreshtoken?: String,
}
export { CustomRequest }