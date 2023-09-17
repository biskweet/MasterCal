"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MasterCalMainPageController = void 0;
const express_1 = require("express");
const tinylogger_1 = require("tinylogger");
const MasterCalMainPageController = (0, express_1.Router)();
exports.MasterCalMainPageController = MasterCalMainPageController;
MasterCalMainPageController.get('/', (req, res) => {
    // Before anything, log the request
    let ip = req.headers['x-forwarded-for'];
    ip = ip instanceof Array ? ip.join(',') : ip;
    tinylogger_1.TinyLogger.log(`${ip || req.socket.remoteAddress || '?.?.?.?'} | website`);
    return res.sendFile("index.html", { root: "./" });
});
