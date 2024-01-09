import { Request, RequestHandler, Response } from "express";
import { TinyLogger } from "~~/tinylogger";

const logger: RequestHandler = (req, res, next) => {
    let ip = req.headers['x-forwarded-for'];
    ip = ip instanceof Array ? ip.join(',') : ip;

    TinyLogger.log(`${ip || req.socket.remoteAddress || '?.?.?.?'} | ${req.originalUrl} | ${req.get('User-Agent')}`);

    next();
}

export { logger };
