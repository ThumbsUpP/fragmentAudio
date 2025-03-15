import winston from "winston";

/**
 * Logger utility for consistent logging across the application
 */
export class Logger {
  private logger: winston.Logger;

  constructor(serviceName: string) {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] [${serviceName}] [${level.toUpperCase()}]: ${message}`;
        })
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "orchestration-service.log" })
      ]
    });
  }

  /**
   * Log an info message
   * @param message The message to log
   */
  info(message: string): void {
    this.logger.info(message);
  }

  /**
   * Log a warning message
   * @param message The message to log
   */
  warn(message: string): void {
    this.logger.warn(message);
  }

  /**
   * Log an error message
   * @param message The message to log
   */
  error(message: string): void {
    this.logger.error(message);
  }

  /**
   * Log a debug message
   * @param message The message to log
   */
  debug(message: string): void {
    this.logger.debug(message);
  }
}
