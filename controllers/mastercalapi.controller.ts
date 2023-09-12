import { Request, Response, Router } from "express";
import { DatabaseIndexer } from "~~/databaseindexer";
import { config } from "~~/config";
import * as fs from "fs";
import * as path from "path";
import { endpoints } from "~~/endpoints";
import { Endpoint } from "~~/interfaces";

const ICAL = require("ical.js");

const MasterCalAPIController = Router();

MasterCalAPIController.get('/', (req: Request, res: Response) => {
    if (!req.query.courses || !req.query.speciality)
        return res.status(400) && res.send("Invalid query parameters.");

    req.query.courses = req.query.courses as string;
    req.query.speciality = req.query.speciality as string;

    if (!config.regexValidateQueryParams.exec(req.query.courses))
        return res.status(400) && res.send("Invalid query parameters.");

    // Transform to uppercase string array
    const coursesArray = req.query.courses.toUpperCase().split(',');

    // Ensure the courses exist and the speciality is valid
    if (coursesArray.some((courseCode: string) => !Object.keys(DatabaseIndexer.index).includes(courseCode)))
        return res.status(400) &&
               res.send("Course not found.");

    if (!endpoints.some((endpoint: Endpoint) => endpoint.name == req.query.speciality))
        return res.status(400) &&
               res.send("Speciality does not exist or is not supported. Please double check.")

    const calendarsDir = path.join(process.cwd(), "calendars/");

    const userCalendar = new ICAL.Component("vcalendar");
    coursesArray.forEach((courseCode: string) => {
        const filename = DatabaseIndexer.index[courseCode];
        const icaltext = fs.readFileSync(path.join(calendarsDir, filename + ".ics"), "utf-8");
        const jcalData = ICAL.parse(icaltext);
        const calendar = new ICAL.Component(jcalData);

        const events = calendar.getAllSubcomponents("vevent");

        // Add all events that matches the course code
        events.forEach((event: any) => {
            const match = event.getFirstPropertyValue("summary").match(config.regexCourseCode);

            // If we detect a course code and it matches with the request, add to the calendar
            if (match && match[1] == courseCode)
                userCalendar.addSubcomponent(event);

            // If no match was detected AND the current calendar is the student's speciality we add it too.
            // It could be a relevant event (example: "M1 - Réunion rentrée générale 1" or "ATRIUM DES MÉTIERS")
            if (!match && filename == req.query.speciality)
                userCalendar.addSubcomponent(event);
        });
    })

    res.set({ "content-type": "text/calendar; charset=utf-8" });
    return res.send(userCalendar.toString());
});

export { MasterCalAPIController };
