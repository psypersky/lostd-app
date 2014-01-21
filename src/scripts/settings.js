define(function() {
	var localStorage = window.localStorage ? window.localStorage : {};

	return {
		getLoginServer: function() {
			var r = localStorage['login_server'];
			return r ? r : 'federation.lostd.com';
		},

		setLoginServer: function(loginServer) {
			if (!loginServer || loginServer.length === 0)
				delete localStorage['login_server'];
			else
				localStorage['login_server'] = loginServer;
		}
	};
});