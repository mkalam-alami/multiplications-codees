/**
 * Exports the production build into a standalone folder.
 */

import * as fs from "fs-extra";
import * as path from "path";

const ROOT_PATH = __dirname;
const EXPORT_PATH = path.resolve(__dirname, "dist-export");

fs.mkdirpSync(path.resolve(EXPORT_PATH, "frontend"));
fs.copyFileSync("frontend/webpack.config.js", path.resolve(EXPORT_PATH, "dist/frontend/webpack.config.js"));

for (const file of ["tsconfig.prod.json", "tsconfig.json", "package.json"]) {
  fs.copyFileSync(file, path.resolve(EXPORT_PATH, file));
}

for (const folder of ["dist", "static"]) {
  fs.copySync(path.resolve(ROOT_PATH, folder), path.resolve(EXPORT_PATH, folder));
}
