import { Request, RequestHandler, Response } from "express";
import { TinyLogger } from "~~/tinylogger";

const logger: RequestHandler = (req, res, next) => {
    let ip = req.headers['x-forwarded-for'];
    ip = ip instanceof Array ? ip.join(',') : ip;

    const log = (req.path == '/')
        ? `website`
        : `specialty=[${req.query.specialty}]  courses=[${req.query.courses}]`;
    
    TinyLogger.log(`${ip || req.socket.remoteAddress || '?.?.?.?'} | ${log}`);

    next();
}

export { logger };
