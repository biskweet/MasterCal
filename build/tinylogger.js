"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TinyLogger = void 0;
const fs = __importStar(require("fs"));
const config_1 = require("~~/config");
class TinyLogger {
    static log(logEntry) {
        const now = new Date();
        const l = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ` +
            `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} | ` +
            logEntry;
        this.logs.push(l);
        this.startDumpTimeout();
    }
    static startDumpTimeout() {
        // If the buffer reaches 15 elements we dump regardless
        if (this.logs.length >= 15)
            this.dumpLog(this.logs);
        // If no timeout was planned we start one
        if (this.lastTimeoutId == null)
            this.lastTimeoutId = setTimeout(this.dumpLog, config_1.config.logTimeoutDuration, this.logs);
        // A timeout was planned, refresh it
        else {
            clearTimeout(this.lastTimeoutId);
            this.lastTimeoutId = setTimeout(this.dumpLog, config_1.config.logTimeoutDuration, this.logs);
        }
    }
    static dumpLog(logs) {
        fs.appendFileSync(config_1.config.logsFilename, logs.join('\n') + '\n');
        TinyLogger.logs = [];
        TinyLogger.lastTimeoutId = null;
    }
}
exports.TinyLogger = TinyLogger;
/**
 * Very minimal and stupid logger but I just want to put a term to this project and deploy
 */
TinyLogger.logs = [];
TinyLogger.lastTimeoutId = null;
