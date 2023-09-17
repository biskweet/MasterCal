"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseIndexer = void 0;
const endpoints_1 = require("~~/endpoints");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const config_1 = require("~~/config");
const ICAL = require("ical.js");
class DatabaseIndexer {
    static async init() {
        await this.repopulate();
        setInterval(() => {
            this.repopulate();
        }, config_1.config.databaseUpdateDelay);
    }
    static async repopulate() {
        /**
         * This function downloads all calendars from CalDavZAP.
         * It downloads each file one by one to imitate a browser's behavior
         * in order to avoid getting blocked.
         */
        const calendarsDir = path.join(process.cwd(), "calendars/");
        fs.mkdirSync(calendarsDir, { recursive: true });
        for (const [index, endpoint] of endpoints_1.endpoints.entries()) {
            const data = await fetch(endpoint.route, {
                headers: {
                    "Authorization": `Basic ${config_1.config.CALDAVZAP_TOKEN}`
                }
            }).then(response => response.text());
            // Now we index each course and link it to the newly downloaded file for faster retrieving
            const processed = await this.processCalendar(data, endpoint.name);
            // Only write the processed data (don't keep the original which has tons of obsolete data)
            fs.writeFileSync(path.join(calendarsDir, endpoint.name + ".ics"), processed);
            process.stdout.write(`\rSaved calendar for ${endpoint.name} (${index + 1} over ${endpoints_1.endpoints.length}).      `);
        }
        process.stdout.write('\n');
    }
    static async processCalendar(ics, name) {
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
        const relevantEvents = events.filter((event) => {
            return event.getFirstPropertyValue("dtend").compare(academicYearStartingDay) != -1;
        });
        // Create new, clean icalendar with relevant events
        const filteredCal = new ICAL.Component("vcalendar");
        relevantEvents.forEach((event) => filteredCal.addSubcomponent(event));
        // Indexing each course code
        relevantEvents.forEach((event) => {
            try {
                const match = event.getFirstPropertyValue("summary").match(config_1.config.regexCourseCode);
                if (match) {
                    this.index[match[1]] = name;
                }
            }
            catch (err) {
                console.error(`Failed to get getFirstPropertyValue 'summary' for event ${event}\n => ${err}`);
            }
        });
        return filteredCal.toString();
    }
}
exports.DatabaseIndexer = DatabaseIndexer;
DatabaseIndexer.index = {};
