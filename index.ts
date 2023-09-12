import cors from "cors";
import express, { Request, Response } from "express";

import { config } from "config";
import { DatabaseIndexer } from "~~/databaseindexer";


const app = express();
app.use(cors());
app.use('/', (req: Request, res: Response) => {
    return res.send("OK");
});

DatabaseIndexer.init()
    .then(() => {
        console.log(DatabaseIndexer.index);
        app.listen(config.PORT, () => console.log(`Running api on http://${ config.HOST }:${ config.PORT }/`));
    });
