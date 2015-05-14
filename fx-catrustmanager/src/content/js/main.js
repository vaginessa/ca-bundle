"use strict";

document.addEventListener("DOMContentLoaded", function() {
  window.certs = new CACertificates();
  window.ui = new UI(certs);

  ui.populateTable();
});
