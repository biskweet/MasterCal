import { Endpoint } from "~~/interfaces";
import * as fs from "fs";
import * as path from "path";
import * as process from "process";

const UpdateCalendars = async (endpoints: Endpoint[]) => {
    /**
     * This function downloads all calendars from CalDavZAP.
     * It downloads each file one by one to imitate a browser's behavior
     * in order to avoid getting blocked.
     */

    const calendarsDir = path.join(process.cwd(), "calendars/");

    fs.mkdirSync(calendarsDir, { recursive: true })

    for (const [ index, endpoint ] of endpoints.entries()) {
        const response = await fetch(endpoint.route, {
            headers: {
                "Authorization": "Basic c3R1ZGVudC5tYXN0ZXI6Z3Vlc3Q="
            }
        });

        const data = await response.text();
        fs.writeFileSync(path.join(calendarsDir, endpoint.name + ".ics"), data);
        process.stdout.write(`\rSaved calendar for ${endpoint.name} (${index + 1} over ${endpoints.length}).          `);
    }

    process.stdout.write('\n');
}

export { UpdateCalendars }
