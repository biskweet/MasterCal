"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const config_1 = require("config");
const databaseindexer_1 = require("~~/databaseindexer");
const mastercalapi_controller_1 = require("~~/controllers/mastercalapi.controller");
const mastercalmainpage_controller_1 = require("~~/controllers/mastercalmainpage.controller");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use("/mastercal", mastercalmainpage_controller_1.MasterCalMainPageController);
app.use("/mastercal/api", mastercalapi_controller_1.MasterCalAPIController);
databaseindexer_1.DatabaseIndexer.init()
    .then(() => {
    app.listen(config_1.config.PORT, () => console.log(`Running api on http://${config_1.config.HOST}:${config_1.config.PORT}/`));
});
