import log from "shared/core/log";
import Vue from "vue";

const GRID_SIZE = 12

new Vue({
  el: '#app',
  data: {
    constants: {
      GRID_SIZE
    },
    name: 'les gens'
  },
  created() {
    log.info("App initialized");
  }
})
