import { router } from "src/core/http-server";
import "./core/reload";
import { initBrowserReload } from "./core/reload";
import { TestResponse } from "shared/api";

initBrowserReload();

router.get('/test', (ctx) => {
  const testResponse: TestResponse = 'Test works';
  ctx.body = testResponse;
});
