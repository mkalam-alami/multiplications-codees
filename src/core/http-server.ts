/**
 * Initialize the HTTP router and serve static files.
 * Routes can be registered using the `router` export.
 */

import log from "shared/core/log";
import koa from "koa";
import koaRouter from "koa-router";
import koaStatic from "koa-static";
import { STATIC_PATH } from "src/constants";

const PORT = process.env.PORT || 8080;

export const router = new koaRouter();

export const server = new koa();
server.use(router.routes());
server.use(koaStatic(STATIC_PATH))

export function startHttpServer() {
  server.listen(PORT, () => {
    log.info(`Web server started on port ${PORT}`)
  });
}
