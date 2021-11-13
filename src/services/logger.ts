import winston from "winston";

const config = {
  levels: {
    error: 0,
    debug: 1,
    warn: 2,
    json: 3,
    info: 4,
    request: 5,
    response: 6,
  },
  colors: {
    error: "red",
    debug: "blue",
    warn: "yellow",
    json: "grey",
    info: "green",
    request: "cyan",
    response: "magenta",
  },
};

winston.addColors(config.colors);

const myFormat = winston.format.printf((info) => {
  return JSON.stringify(info, null, 2);
});

const logger: winston.Logger | any = winston.createLogger({
  levels: config.levels,
  format: winston.format.combine(
    // winston.format.prettyPrint(),
    // myFormat,
    winston.format.colorize(),
    winston.format.simple()
  ),
  // TODO: cambiar a .log files
  transports: [new winston.transports.Console()],
  level: "response",
});

export default logger;
