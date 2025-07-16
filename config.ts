export const config = {
    HOST: "localhost",
    PORT: 5001,
    CALDAVZAP_TOKEN: "c3R1ZGVudC5tYXN0ZXI6Z3Vlc3Q=",
    regexCourseCode: /((MU|UM)[45][a-zA-Z0-9]{5})[ _-]+?([a-zA-Z]*)/,
    regexValidateQueryParams: /[a-zA-Z,]+/,
    logsFilename: "logs.txt",
    logTimeoutDuration: 2 * 60 * 1000,        // 2 min
    databaseUpdateDelay: 2 * 60 * 60 * 1000,  // 2 hours
}
