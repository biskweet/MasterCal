import * as fs from "fs";
import * as path from "path";

const ICAL = require("ical.js");

const GetEventsFromFile = (filename: string) => {
    const calendarsDir = path.join(process.cwd(), "calendars/");

    const icaltext = fs.readFileSync(path.join(calendarsDir, filename), "utf-8");
    const jcalData = ICAL.parse(icaltext);
    const calendar = new ICAL.Component(jcalData);

    return calendar.getAllSubcomponents("vevent");
}

export { GetEventsFromFile }
