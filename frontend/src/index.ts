import log from "shared/core/log";

window.onload = async function runTest() {
  log.info("Test")
  document.getElementById('app')!.innerHTML = 'Test';
}
