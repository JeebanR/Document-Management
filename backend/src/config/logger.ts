import winston from 'winston';
import path from 'path';
import fs from 'fs';

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'cyan',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `${timestamp} [${level}]: ${message}\n${stack}`
      : `${timestamp} [${level}]: ${message}`;
  }),
);

const transports: winston.transport[] = [
  new winston.transports.Console(),
  new winston.transports.File({ filename: 'logs/error.log', level: 'error', format: winston.format.uncolorize() }),
  new winston.transports.File({ filename: 'logs/combined.log', format: winston.format.uncolorize() }),
];

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
  levels,
  format,
  transports,
});
