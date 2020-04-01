import log from "shared/core/log";
import Vue from "vue";

new Vue({
  el: '#app',
  data: {
    name: 'les gens'
  },
  created() {
    log.info("App initialized");
  }
})
