import * as fs from "fs";
import { config } from "~~/config";

class TinyLogger {
    /**
     * Very minimal and stupid logger but I just want to put a term to this project and deploy
     */

    private static logs: string[] = [];

    private static lastTimeoutId: NodeJS.Timeout | null = null;

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
            this.dumpLog();

        // If no timeout was planned we start one
        if (this.lastTimeoutId == null)
            this.lastTimeoutId = setTimeout(this.dumpLog, config.logTimeoutDuration);

        // A timeout was planned, refresh it
        else {
            clearTimeout(this.lastTimeoutId);
            this.lastTimeoutId = setTimeout(this.dumpLog, config.logTimeoutDuration);
        }
    }

    private static dumpLog() {
        fs.appendFileSync(config.logsFilename, this.logs.join('\n') + '\n');

        this.logs = [];
        this.lastTimeoutId = null;
    }
}

export { TinyLogger };
