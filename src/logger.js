const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

module.exports = createLogger({
    format: combine(
        timestamp({format: 'YYYYMMDD HH:mm:ss'}),
        printf(({ level, message, label, timestamp }) => {
            return `[${timestamp}][${level}] ${message}`;
        })
    ),
    transports: [new transports.Console()]
});
