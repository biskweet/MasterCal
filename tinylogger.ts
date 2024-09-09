import * as fs from "fs";
import { config } from "~~/config";

class TinyLogger {
    /**
     * Very minimal and stupid logger but I just want to put a term to this project and deploy
     */

    private static logs: string[] = [];

    private static lastTimeoutId: NodeJS.Timeout | null = null;

    public static log(logEntry: string) {
        const now = new Date();

        const l = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ` +
                  `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} | ` +
                  logEntry;

	    console.log(l);

        this.logs.push(l);

        this.startDumpTimeout();
    }

    private static startDumpTimeout() {
        // If the buffer reaches 15 elements, we dump regardless of the timeout
        if (this.logs.length >= 15)
            this.dumpLogs(this.logs);

        // If no timeout was planned we start one to buffer in case of multiple logs
        if (this.lastTimeoutId == null)
            this.lastTimeoutId = setTimeout(this.dumpLogs, config.logTimeoutDuration, this.logs);

        // A timeout was planned: refresh it
        else {
            clearTimeout(this.lastTimeoutId);
            this.lastTimeoutId = setTimeout(this.dumpLogs, config.logTimeoutDuration, this.logs);
        }
    }

    private static dumpLogs(logs: string[]) {
        fs.appendFileSync(config.logsFilename, logs.join('\n') + '\n');

        TinyLogger.logs = [];
        TinyLogger.lastTimeoutId = null;
    }
}

export { TinyLogger };
