import { endpoints } from "~~/endpoints";
import * as path from "path";
import * as fs from "fs";
import { config } from "~~/config";

const ICAL = require("ical.js")

class DatabaseIndexer {
    public static index: { [key: string]: string } = {};

    public static async init() {
        await this.repopulate();

        setInterval(() => {
            this.repopulate();
        }, config.databaseUpdateDelay)
    }

    private static async repopulate() {
        /**
         * This function downloads all calendars from CalDavZAP.
         * It downloads each file one by one to imitate a browser's behavior
         * in order to avoid getting blocked.
         */

        const calendarsDir = path.join(process.cwd(), "calendars/");

        fs.mkdirSync(calendarsDir, { recursive: true });

        for (const [ index, endpoint ] of endpoints.entries()) {
            const data = await fetch(endpoint.route, {
                headers: {
                    "Authorization": `Basic ${config.CALDAVZAP_TOKEN}`
                }
            }).then(response => response.text())

            // Now we index each course and link it to the newly downloaded file for faster retrieving
            const processed = await this.processCalendar(data, endpoint.name)

            // Only write the processed data (don't keep the original which has tons of obsolete data)
            fs.writeFileSync(path.join(calendarsDir, endpoint.name + ".ics"), processed);

            process.stdout.write(`\rSaved calendar for ${endpoint.name} (${index + 1} over ${endpoints.length}).      `);
        }

        process.stdout.write('\n');
    }

    private static async processCalendar(ics: string, name: string) : Promise<string> {
        /**
         * Processes a calendar by indexing each cours to the corresponding containing file
         * (eg: MU4IN900 -> M1_SFPN). It also creates a lighter calendar only containing
         * courses for the current academic year.
         */

        const jcalData = ICAL.parse(ics);
        const calendar = new ICAL.Component(jcalData);

        const events = calendar.getAllSubcomponents("vevent");

        const today = new Date();
        const academicYearStartingDay = new ICAL.Time({
            year: today.getMonth() < 8 ? today.getFullYear() - 1 : today.getFullYear(),
            month: 9,
            day: 1,
            isDate: true
        });

        // Only keep events belonging to the current academic year
        const relevantEvents = events.filter((event: any) => {
            return event.getFirstPropertyValue("dtend").compare(academicYearStartingDay) != -1;
        });

        // Create new, clean icalendar with relevant events
        const filteredCal = new ICAL.Component("vcalendar");
        relevantEvents.forEach((event: any) => filteredCal.addSubcomponent(event))

        // Indexing each course code
        relevantEvents.forEach((event: any) => {
            try {
                const match = event.getFirstPropertyValue("summary").match(config.regexCourseCode);
                if (match) {
                    this.index[match[1]] = name;
                }
            } catch (err) {
                console.error(`Failed to get getFirstPropertyValue 'summary' for event ${event}\n => ${err}`);
            }
        });

        return filteredCal.toString();
    }
}

export { DatabaseIndexer };
