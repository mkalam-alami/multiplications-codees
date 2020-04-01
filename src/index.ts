import "src/core/log-config";
import "src/core/http-server";
import { startHttpServer } from "src/core/http-server";
import { initBrowserReload } from "src/core/reload";
import { startWebpack } from "src/core/webpack";
import "./routes";

(async() => {
  initBrowserReload();

  if (process.env.NODE_ENV !== 'production') {
    await startWebpack();
  }
  
  startHttpServer();
})();
