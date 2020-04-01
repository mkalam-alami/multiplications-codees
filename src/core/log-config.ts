/**
 * Customize the logger to display the filename (can only be done on the server side).
 */

import * as path from "path";
import { ROOT_PATH } from "src/constants";
import errorStackParser from "error-stack-parser";
import chalk from "chalk";
import log from "shared/core/log";

log.useMiddleware((messageParts: string[]) => {
  messageParts.splice(1, 0, chalk.gray(getCallingFile()));
  return messageParts;
});

function getCallingFile(): string {
  const callingFileFrame = errorStackParser.parse(new Error())
    .find((frame => frame.fileName.includes(ROOT_PATH)
      && frame.fileName !== __filename
      && frame.fileName !== log.filename));
  return path.relative(ROOT_PATH, callingFileFrame.fileName);
}
