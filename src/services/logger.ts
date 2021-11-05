import pino from "pino";

const _logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

const info = async (msg: string, sth?: any) => {
  _logger.info(`${msg}\n${sth ? JSON.stringify(sth, null, 2) : ""}`);
};
const error = async (msg: string, sth?: any) => {
  _logger.error(`${msg}\n${sth ? JSON.stringify(sth, null, 2) : ""}`);
};

const logger = {
  info,
  error,
};

export default logger;
