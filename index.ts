import cors from "cors";
import express from "express";
import { Request, Response } from 'express'
import { config } from "config";

import * as https from "https";
import * as fs from "fs";

const app = express();
app.use(cors());
app.use("/", (req: Request, res: Response) => {
    return res.send("OK");
})

app.listen(config.PORT, () => console.log(`Running api on ${ config.HOST }:${ config.PORT }/`));

