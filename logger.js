// This file will contain the logger middleware that will log the result to a file and to the console.
const fs = require("fs");

class Logger {
    
    static logFilePath = null;
    static logFile = null;

    static setLogFilePath(path) {
        this.logFilePath = path;
        // open the file and get it ready to start writing the los into it
        this.logFile = fs.openSync(this.logFilePath, 'w');
    }

    static closeLogFile() {
        fs.closeSync(this.logFile);
    }

    /**
     * This method will log the message to the console and to the file if the logFilePath is set.
     * @param {*} message 
     */
    static log(message) {
        console.log(message);
        // write the message to the file if the logFilePath is set. The Message will be appended to the end of the file
        if (this.logFilePath) {
            fs.writeSync(this.logFile, `LOG:${new Date().toLocaleString()} ${message}\n`);
        }
    }
    
    /**
     * This method will log the message to the console and to the file if the logFilePath is set.
     * @param {*} message 
     */
    static error(message) {
        console.error(message);
        // write the message to the file if the logFilePath is set. The Message will be appended to the end of the file
        if (this.logFilePath) {
            fs.writeSync(this.logFile, `ERROR:${new Date().toLocaleString()} ${message}\n`);
        }
    }

    /**
    * This method will log the message to the console and to the file if the logFilePath is set.
    * @param {*} message 
    */
    static warn(message) {
        console.warn(message);
        // write the message to the file if the logFilePath is set. The Message will be appended to the end of the file
        if (this.logFilePath) {
            fs.writeSync(this.logFile, `WARN:${new Date().toLocaleString()} ${message}\n`);
        }
    }
}

module.exports = Logger;