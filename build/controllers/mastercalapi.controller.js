"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MasterCalAPIController = void 0;
const express_1 = require("express");
const databaseindexer_1 = require("~~/databaseindexer");
const config_1 = require("~~/config");
const endpoints_1 = require("~~/endpoints");
const GetEventsFromFile_1 = require("~~/utils/GetEventsFromFile");
const tinylogger_1 = require("~~/tinylogger");
const ICAL = require("ical.js");
const MasterCalAPIController = (0, express_1.Router)();
exports.MasterCalAPIController = MasterCalAPIController;
MasterCalAPIController.get('/', (req, res) => {
    // Before anything, log the request
    let ip = req.headers['x-forwarded-for'];
    ip = ip instanceof Array ? ip.join(',') : ip;
    tinylogger_1.TinyLogger.log(`${ip || req.socket.remoteAddress || '?.?.?.?'} | specialty=[${req.query.specialty}]  courses=[${req.query.courses}]`);
    // Query parameters check
    if (!req.query.courses || !req.query.specialty)
        return res.status(400) && res.send("Invalid query parameters.");
    // Enforce type
    req.query.courses = req.query.courses;
    req.query.specialty = req.query.specialty;
    if (!config_1.config.regexValidateQueryParams.exec(req.query.courses))
        return res.status(400) && res.send("Invalid query parameters.");
    // Transform to uppercase string array
    const coursesArray = req.query.courses.toUpperCase().split(',');
    // Ensure there is no more than 8 courses
    if (coursesArray.length >= 10)
        return res.status(400) &&
            res.send("Too many courses!");
    // Ensure the specialty exists
    if (!endpoints_1.endpoints.some((endpoint) => endpoint.name == req.query.specialty))
        return res.status(400) &&
            res.send("Specialty does not exist or is not supported. Please double check your input.");
    // Ensure all courses exist
    if (coursesArray.some((courseCode) => !Object.keys(databaseindexer_1.DatabaseIndexer.index).includes(courseCode)))
        return res.status(400) &&
            res.send("Course not found.");
    const userCalendar = new ICAL.Component("vcalendar");
    coursesArray.forEach((courseCode) => {
        const filename = databaseindexer_1.DatabaseIndexer.index[courseCode] + ".ics";
        const events = (0, GetEventsFromFile_1.GetEventsFromFile)(filename);
        // Add all events that matches the course code
        events.forEach((event) => {
            const match = event.getFirstPropertyValue("summary").match(config_1.config.regexCourseCode);
            // If we detect a course code and it matches with the request, add to the calendar
            if (match && match[1] == courseCode)
                userCalendar.addSubcomponent(event);
            // If no match was detected AND the current calendar is the student's specialty we add it too,
            // it could be a relevant event (eg: "M1 - Réunion rentrée générale 1", "ATRIUM DES MÉTIERS", etc.)
            if (!match && filename == req.query.specialty)
                userCalendar.addSubcomponent(event);
        });
    });
    // Lastly, packing up events from M1.ics/M2.ics
    const generalMastersEvents = (0, GetEventsFromFile_1.GetEventsFromFile)(req.query.specialty.slice(0, 2) + ".ics");
    generalMastersEvents.forEach((event) => userCalendar.addSubcomponent(event));
    res.set({ "content-type": "text/calendar; charset=utf-8" });
    return res.send(userCalendar.toString());
});
