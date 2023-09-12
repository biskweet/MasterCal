import { Request, Response, Router } from "express";

const MasterCalMainPageController = Router();

MasterCalMainPageController.get('/', (req: Request, res: Response) => {
    return res.send("OK");
})

export { MasterCalMainPageController };
