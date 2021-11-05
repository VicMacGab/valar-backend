import pino from "pino";

const _logger = pino({
  transport: {
    target: "pino-pretty",
  },
});

const info = async (msg: string, sth: any) => {
  _logger.info(`${msg}\n${JSON.stringify(sth, null, 2)}`);
};
const error = async (msg: string, sth: any) => {
  _logger.error(`${msg}\n${JSON.stringify(sth, null, 2)}`);
};

const logger = {
  info,
  error,
};

export default logger;
