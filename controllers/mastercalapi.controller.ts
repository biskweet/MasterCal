import { Request, Response, Router } from "express";
import { DatabaseIndexer } from "~~/databaseindexer";
import { config } from "~~/config";
import { endpoints } from "~~/endpoints";
import { Endpoint } from "~~/interfaces";
import { GetEventsFromFile } from "~~/utils/GetEventsFromFile";

const ICAL = require("ical.js");

const MasterCalAPIController = Router();

MasterCalAPIController.get('/', (req: Request, res: Response) => {
    // Query parameters check
    if (!req.query.courses || !req.query.specialty)
        return res.status(400) &&
               res.send("Invalid query parameters. Must choose a major and at least 1 course.");

    // Enforce type
    req.query.courses = req.query.courses as string;
    req.query.specialty = req.query.specialty as string;

    if (!config.regexValidateQueryParams.exec(req.query.courses))
        return res.status(400) &&
               res.send("Invalid query parameters.");

    // Transform to uppercase string array
    const coursesArray = req.query.courses.toUpperCase().split(',');

    // Ensure there is no more than 8 courses
    if (coursesArray.length >= 10)
        return res.status(400) &&
               res.send("Too many courses!");

    // Ensure the specialty exists
    if (req.query.specialty != "NOSPEC" && !endpoints.some((endpoint: Endpoint) => endpoint.name == req.query.specialty))
        return res.status(400) &&
               res.send("Specialty does not exist or is not supported. Please double check your input.");

    // Ensure all courses exist
    if (coursesArray.some((courseCode: string) => !Object.keys(DatabaseIndexer.index).includes(courseCode)))
        return res.status(400) &&
               res.send("Course not found.");

    const userCalendar = new ICAL.Component("vcalendar");
    coursesArray.forEach((courseCode: string) => {
        const filename = DatabaseIndexer.index[courseCode] + ".ics";
        const events = GetEventsFromFile(filename)

        // Add all events that match the course code
        events.forEach((event: any) => {
            const match = event.getFirstPropertyValue("summary").match(config.regexCourseCode);

            // If we detect a course code and it matches with the request, add to the calendar
            if (match && match[1] == courseCode)
                userCalendar.addSubcomponent(event);

            // If no match was detected AND the current calendar is the student's specialty, we add it too,
            // as it could be a relevant event (eg: "M1 - Réunion rentrée générale 1", "ATRIUM DES MÉTIERS", etc.)
            if (!match && filename == req.query.specialty)
                userCalendar.addSubcomponent(event);
        });
    });

    // Lastly, packing up events from M1.ics/M2.ics if the user is a student
    if (req.query.specialty != "NOSPEC") {
        const generalMastersEvents = GetEventsFromFile(req.query.specialty.slice(0, 2) + ".ics")
        generalMastersEvents.forEach((event: any) => userCalendar.addSubcomponent(event));
    }
        
    res.set({ "content-type": "text/calendar; charset=utf-8" });
    return res.send(userCalendar.toString());
});

export { MasterCalAPIController };
