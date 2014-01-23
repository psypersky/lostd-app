'use strict';

define(function() {

	var localStorage;

	if (!window.localStorage) {
		console.error('Browser does not support local storage. Settings will not persist..');
		localStorage = {};
	} else {
		localStorage = window.localStorage;
	}

	return {
		getFederationServer: function() {
			var t = localStorage['federation_server'];
			return t ? t : 'http://federation.lostd.com';
		},

		setFederationServer: function(federationServer) {
			if (federationServer.length === 0)
				delete localStorage['federation_server'];
			else
				localStorage['federation_server'] = federationServer;
		},

		getDatabaseURL: function() {
			var t = localStorage['database_url'];
			return t ? t : '';
		},

		setDatabaseURL: function(databaseUrl) {
			console.log('Setting database url to: ', databaseUrl);
			if (databaseUrl.length === 0)
				delete localStorage['database_url'];
			else
				localStorage['database_url'] = databaseUrl;
		}
	};

});