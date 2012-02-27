const {Cc,Ci,Cu} = require("chrome");
const url = require("url");

var loginManager = Cc["@mozilla.org/login-manager;1"].getService(Ci.nsILoginManager);

function getLoginsTable() {
    var logins = loginManager.getAllLogins();
    var loginsTable = {};
    for (var login in logins) {
        var loginInfo = logins[login];
        if (!loginsTable[loginInfo.password])
            loginsTable[loginInfo.password] = [];
        var loginSite = {
            hostname: loginInfo.hostname
        };
        
        try {
             loginSite.host = url.URL(loginInfo.hostname).host;   
        }
        catch (e) {
            // These might not all be valid URLs, e.g. chrome://...
            // So if the URL class throws an error, just use the hostname again.
            loginSite.host = loginInfo.hostname;
        }
        
        loginsTable[loginInfo.password].push(loginSite);
    }
    return loginsTable;
}

function getLoginAges() {
    var logins = loginManager.getAllLogins();
	var passwordTable = {};
	
	function getWhenWhere(loginInfo,loginMeta) {
		return {
				'when' : loginMeta.timePasswordChanged,
				'where' : loginInfo.hostname 
		};
	}
	
	for (var login in logins) {
		var loginMeta = logins[login].QueryInterface(Ci.nsILoginMetaInfo);
		var password = logins[login].password;
		var passwordTimes = getWhenWhere(logins[login],loginMeta);
		
		if (passwordTable[password]) {
			// passwordTable[password].timesUsed.push(loginMeta.timePasswordChanged);
			passwordTable[password].timesUsed.push(passwordTimes);
			passwordTable[password].timeLastChanged = Math.min(loginMeta.timePasswordChanged,passwordTable[password].timeLastChanged);
		}
		else {
			passwordTable[password] = {
				timesUsed: [passwordTimes],
				timeLastChanged: loginMeta.timePasswordChanged
			};
		}
	}
	return passwordTable;
}


exports['getLoginsTable'] = getLoginsTable;
exports['getLoginAges'] = getLoginAges;