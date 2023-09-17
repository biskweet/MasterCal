import { Request, Response, Router } from "express";
import { TinyLogger } from "tinylogger";

const MasterCalMainPageController = Router();

MasterCalMainPageController.get('/', (req: Request, res: Response) => {
    // Before anything, log the request
    let ip = req.headers['x-forwarded-for'];
    ip = ip instanceof Array ? ip.join(',') : ip;
    TinyLogger.log(`${ip || req.socket.remoteAddress || '?.?.?.?'} | website`);

    return res.sendFile("index.html", { root: "./" });
})

export { MasterCalMainPageController };
