import * as fs from "fs";
import { config } from "~~/config";

class TinyLogger {
    /**
     * Very minimal and stupid logger but I just want to put a term to this project and deploy
     */

    private static logs: string[] = [];

    public static log(ip: string, query: string) {
        this.logs.push(`${new Date().toLocaleString()} - ${ip} - ${query}`);

        if (this.logs.length >= 15)
            this.dumpLog();
    }

    private static dumpLog() {
        fs.appendFileSync(config.logsFilename, this.logs.join('\n'));

        this.logs = [];
    }
}

export { TinyLogger };
