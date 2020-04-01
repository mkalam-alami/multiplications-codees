/**
 * Build the client bundle upon startup (and on every client code change, when using development mode).
 */

import webpackConfig from "frontend/webpack.config.js";
import webpack from "webpack";

export function startWebpack(buildHandler?: webpack.ICompiler.Handler): Promise<webpack.Stats> {
  return new Promise((resolve, reject) => {
    const compiler = webpack({
      ...webpackConfig,
      mode: process.env.NODE_ENV || 'development'
    })

    compiler.watch({}, (err, stats) => {
      if (!err) resolve(stats); else reject(err);
      if (buildHandler) buildHandler(err, stats);
    })
  })
}
