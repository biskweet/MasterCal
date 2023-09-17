"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    HOST: "localhost",
    PORT: 5001,
    CALDAVZAP_TOKEN: "c3R1ZGVudC5tYXN0ZXI6Z3Vlc3Q=",
    regexCourseCode: /(MU[45](?:IN|EE)[a-zA-Z]?\d{2,3})[ _-]/,
    regexValidateQueryParams: /[a-zA-Z,]+/,
    logsFilename: "logs.txt",
    logTimeoutDuration: 2 * 60 * 1000,
    databaseUpdateDelay: 6 * 60 * 60 * 1000, // 6 hours
};
