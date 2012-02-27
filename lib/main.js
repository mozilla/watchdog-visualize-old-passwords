const dataDir = require("self").data;
const pagemod = require("page-mod");
const passwordManager = require("passwordManager");
const widgets = require("widget");
const tabs = require("tabs");

var widget = widgets.Widget({  id: "privacy-watchdog-visualize-old-link",  
							label: "Password Age Visualizer",
							contentURL: dataDir.url("lock-red-new.png"),
							onClick: function() {    openPasswordVisualizer();  }
						});
						
pagemod.PageMod({
  include: dataDir.url("view_passwords.html"),
  contentScriptFile: [dataDir.url("js/util.js"),dataDir.url("js/view_passwords_content_script.js")],
  onAttach: function(worker) {
      worker.port.on('get_logins_table', function() {
          worker.port.emit('logins_table', passwordManager.getLoginAges());
      });
  }
});

function openPasswordVisualizer() {
    tabs.open(dataDir.url("view_passwords.html"));
}