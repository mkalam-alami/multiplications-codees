import findPackageJson from "find-package-json";
import webpackConfig from "frontend/webpack.config.js";
import * as path from "path";

export const ROOT_PATH = path.dirname(findPackageJson().next().filename);
export const STATIC_PATH = path.resolve(ROOT_PATH, 'static');
export const BUILD_OUTPUT_PATH = path.resolve(webpackConfig.output.path, webpackConfig.output.filename);
