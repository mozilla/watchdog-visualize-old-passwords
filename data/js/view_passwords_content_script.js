var loginsCallback;

var logins;

unsafeWindow.loadLogins = function(callback) {
    loginsCallback = callback;
    self.port.emit('get_logins_table',{});
};

self.port.on('logins_table', function(msg) {
    loginsCallback(msg);
});