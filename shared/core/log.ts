/**
 * Simple logger with colors and a timestamp.
 */

import chalk from "chalk";

export type LoggerMiddleware = (messageParts: string[]) => string[];

class Logger {

  private middleware: LoggerMiddleware[] = [];

  filename = __filename;

  debug(...args: any[]) {
    this.log(chalk.blueBright, args);
  }

  info(...args: any[]) {
    this.log(chalk.white, args);
  }

  warn(...args: any[]) {
    this.log(chalk.yellowBright, args);
  }

  error(...args: any[]) {
    this.log(chalk.redBright, args);
  }

  useMiddleware(middleware: LoggerMiddleware) {
    this.middleware.push(middleware);
  }

  private log(color: chalk.Chalk, args: any[]) {
    const timestamp = chalk.green(new Date().toISOString());
    const output = color.apply(chalk, args);

    let messageParts = [timestamp, output];
    this.middleware.forEach((middleware) => messageParts = middleware(messageParts));
    console.log(messageParts.join(' '));
  }

}

export default new Logger();
