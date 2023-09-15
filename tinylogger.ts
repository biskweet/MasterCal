import * as fs from "fs";
import { config } from "~~/config";

class TinyLogger {
    /**
     * Very minimal and stupid logger but I just want to put a term to this project and deploy
     */

    public static logs: string[] = [];

    public static lastTimeoutId: NodeJS.Timeout | null = null;

    public static log(ip: string, query: string) {
        const now = new Date();

        const l = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ` +
                `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} | ` +
                ip + ' | ' + query;

        this.logs.push(l);

        this.startDumpTimeout();
    }

    private static startDumpTimeout() {
        // If the buffer reaches 15 elements we dump regardless
        if (this.logs.length >= 15)
            this.dumpLog(this.logs);

        // If no timeout was planned we start one
        if (this.lastTimeoutId == null)
            this.lastTimeoutId = setTimeout(this.dumpLog, config.logTimeoutDuration, this.logs);

        // A timeout was planned, refresh it
        else {
            clearTimeout(this.lastTimeoutId);
            this.lastTimeoutId = setTimeout(this.dumpLog, config.logTimeoutDuration, this.logs);
        }
    }

    private static dumpLog(logs: string[]) {
        fs.appendFileSync(config.logsFilename, logs.join('\n') + '\n');

        TinyLogger.logs = [];
        TinyLogger.lastTimeoutId = null;
    }
}

export { TinyLogger };
