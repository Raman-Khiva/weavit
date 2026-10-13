import pino from "pino";

export const logger = pino({
    level: "debug",

    transport: {
        target: "pino-pretty",
        options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
        },
    },

    redact: {
        paths: [
            "req.headers.authorization",
            "req.headers.cookie",
            "password",
            "token",
            "accessToken",
            "refreshToken",
        ],
        censor: "[REDACTED]",
    },
});