import { Request, Response, Router } from "express";
import { DatabaseIndexer } from "../databaseindexer";
import { config } from "../config";
import { endpoints } from "../endpoints";
import { Endpoint } from "../interfaces";
import { GetEventsFromFile } from "../utils/GetEventsFromFile";
import { IsCourseOIP } from "../utils/IsCourseOIP";

const ICAL = require("ical.js");

const MasterCalAPIController = Router();

MasterCalAPIController.get('/', (req: Request, res: Response) => {
    // Query parameters existence check
    if (!req.query.specialty)
        return res.status(400) &&
               res.send("Invalid query parameters: Must choose a major.");

    // Enforce type
    req.query.courses = req.query.courses as string;
    req.query.specialty = req.query.specialty as string;

    // Transform to array of uppercase strings
    const coursesArray = (req.query.courses)
                                ? req.query.courses.toUpperCase().split(',')
                                : [];

    // Ensure there is no more than 12 courses
    if (coursesArray.length > 15)
        return res.status(400) &&
               res.send("Invalid query parameters: Too many courses!");

    // Ensure all courses exist
    if (coursesArray.some((courseCode: string) => !Object.keys(DatabaseIndexer.index).includes(courseCode)))
        return res.status(400) &&
               res.send("Invalid query parameters: Course not found.");

    // Find the corresponding endpoint using the specialty code
    let queryEndpoint = endpoints.find( (endpt) => endpt.name === req.query.specialty);

    // If no corresponding endpoint was found and it's not NOSPEC, return an error
    if (!queryEndpoint && req.query.specialty != "NOSPEC") {
        return res.status(400) &&
               res.send("Invalid query parameters: Specialty does not exist or is not supported. " +
                        "Please double check your input.");
    }

    const userCalendar = new ICAL.Component("vcalendar");

    // If an endpoint was found but it's an alternance, just return the year calendar + their specialty
    // Alternance specialties have a special treatment, they don't get to choose courses
    if (queryEndpoint?.isAlternance) {
        const generalMastersEvents = GetEventsFromFile(req.query.specialty.slice(0, 2) + ".ics")
        generalMastersEvents.forEach((event: any) => userCalendar.addSubcomponent(event));

        const events = GetEventsFromFile(req.query.specialty + ".ics");

        events.forEach((event: any) => userCalendar.addSubcomponent(event));

        res.set({ "content-type": "text/calendar; charset=utf-8" });
        return res.send(userCalendar.toString());
    }

    // Now either the queryEndpoint exists and the specialty is not an alternance,
    // or queryEndpoint is falsy and the NOSPEC flag is set


    // For each course queried, add all matching events to the custom user calendar
    coursesArray.forEach((courseCode: string) => {
        if (IsCourseOIP(courseCode))  // OIP should not be here but just to be sure
            return;

        const filename = DatabaseIndexer.index[courseCode] + ".ics";
        const events = GetEventsFromFile(filename)

        // Add all events that match the course code
        events.forEach((event: any) => {
            const match = event.getFirstPropertyValue("summary").match(config.regexCourseCode);

            // If we detect a course code and it matches with the request, add to the calendar
            if (match && match[1] == courseCode)
                userCalendar.addSubcomponent(event);
        });
    });

    // Gathering events from M1.ics/M2.ics and MX_XXX.ics if the user is a student
    if (req.query.specialty != "NOSPEC") {
        const generalMastersEvents = GetEventsFromFile(req.query.specialty.slice(0, 2) + ".ics")
        generalMastersEvents.forEach((event: any) => userCalendar.addSubcomponent(event));

        // Add all events that are NOT courses but belong to the user's
        // specialty calendar, except OIP (we also add OIP separately here)
        const filename = req.query.specialty + ".ics";
        const events = GetEventsFromFile(filename);

        events.forEach((event: any) => {
            const match = event.getFirstPropertyValue("summary").match(config.regexCourseCode);

            // match being undefined means it's not a course, it's some uncategorized event -> add it
            // if match IS defined then it's a course, but only add it if it's OIP
            if (!match || IsCourseOIP(match[1]))
                userCalendar.addSubcomponent(event);
        })
    }

    res.set({ "content-type": "text/calendar; charset=utf-8" });
    return res.send(userCalendar.toString());
});

export { MasterCalAPIController };
