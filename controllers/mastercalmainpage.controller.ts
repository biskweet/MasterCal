import { Request, Response, Router } from "express";

const MasterCalMainPageController = Router();

MasterCalMainPageController.get('/', (req: Request, res: Response) => {
    return res.sendFile("index.html", { root: "./" });
})

export { MasterCalMainPageController };
