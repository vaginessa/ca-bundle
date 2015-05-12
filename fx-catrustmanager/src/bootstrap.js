const myAddonId = "catrustmanager@schub.io";

const {classes: Cc, interfaces: Ci} = Components;

const OBS = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
const win = Cc["@mozilla.org/appshell/window-mediator;1"]
  .getService(Components.interfaces.nsIWindowMediator)
  .getMostRecentWindow("navigator:browser");

let optionObserver = {
  observe: function(subject, topic, data) {
    if (topic !== "addon-options-displayed" || data !== myAddonId) {
      return;
    }
    let document = subject.QueryInterface(Ci.nsIDOMDocument),
        button = document.getElementById("open-catrustmanager");
    button.addEventListener("command", this.openTrustman);
  },

  openTrustman: function(event) {
    win.openUILinkIn("chrome://catrustmanager/content/catrustmanager.html", "tab");
  }
}

let install = function(data, reason) {};
let uninstall = function(data, reason) {};

let startup = function(data, reason) {
  OBS.addObserver(optionObserver, "addon-options-displayed", false);
};

let shutdown = function(data, reason) {
  OBS.removeObserver(optionObserver, "addon-options-displayed", false);
};
