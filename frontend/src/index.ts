import axios from "axios";
import { TestResponse } from "shared/api";
import log from "shared/core/log";

window.onload = async function runTest() {
  const response = await axios.get<TestResponse>('/test', { responseType: 'text' });
  document.getElementById('app')!.innerHTML = response.data;
  log.info("App started");
}
