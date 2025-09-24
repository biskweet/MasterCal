import * as fs from "fs";
import { config } from "./config";

class TinyLogger {
    /**
     * Very minimal and stupid logger but I just want to put a term to this project and deploy
     */

    private static logs: string[] = [];

    private static lastTimeoutId: NodeJS.Timeout | null = null;

    public static log(logEntry: string) {
        const now = new Date();

        const l = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 8)} | ${logEntry}`;

        console.log(l);

        this.logs.push(l);
        this.startDumpTimeout();
    }

    private static startDumpTimeout() {
        // If the buffer reaches 15 elements, we dump regardless of the timeout
        if (this.logs.length >= 15) {
            clearTimeout(this.lastTimeoutId || -1);
            this.dumpLogs(this.logs);
        }

        // If no timeout was planned we start one to buffer in case of multiple logs
        else if (this.lastTimeoutId == null)
            this.lastTimeoutId = setTimeout(TinyLogger.dumpLogs, config.logTimeoutDuration, [...this.logs]);

        // A timeout was planned: refresh it
        else {
            clearTimeout(this.lastTimeoutId);
            this.lastTimeoutId = setTimeout(TinyLogger.dumpLogs, config.logTimeoutDuration, [...this.logs]);
        }
    }

    private static dumpLogs(logs: string[]) {
        fs.appendFileSync(config.logsFilename, logs.join('\n') + '\n');

        TinyLogger.logs = [];
        TinyLogger.lastTimeoutId = null;
    }
}

export { TinyLogger };
