import cors from "cors";
import express, { Request, Response } from "express";

import { config } from "config";
import { UpdateCalendars } from "~~/utils/UpdateCalendars";
import { endpoints } from "~~/endpoints";


const app = express();
app.use(cors());
app.use('/', (req: Request, res: Response) => {
    return res.send("OK");
});

UpdateCalendars(endpoints)
    .catch((err: any) => console.error(`Failed to download calendars : ${err}`))

setInterval( () => {
    UpdateCalendars(endpoints)
        .catch((err: any) => {
            console.error(`Failed to download calendars : ${err}`)
        })
}, 4 * 60 * 60 * 1000 /* 4h interval */);

app.listen(config.PORT, () => console.log(`Running api on http://${ config.HOST }:${ config.PORT }/`));
