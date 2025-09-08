import cors from "cors";
import express from "express";

import { config } from "./config";
import { DatabaseIndexer } from "./databaseindexer";
import { MasterCalAPIController } from "./controllers/mastercalapi.controller";
import { MasterCalMainPageController } from "./controllers/mastercalmainpage.controller";
import { logger } from "./utils/Logger";

const app = express();
app.use(cors());

app.use(logger);

app.use("/",    MasterCalMainPageController);
app.use("/api", MasterCalAPIController);

DatabaseIndexer.init().then(() => {
	app.listen(config.PORT, () => console.log(`Running api on http://${ config.HOST }:${ config.PORT }/`));
});
