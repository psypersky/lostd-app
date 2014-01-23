'use strict';

define(function() {

	var localStorage;

	if (!window.localStorage) {
		console.error('Browser does not support local storage. Settings will not persist..');
		localStorage = {};
	} else {
		localStorage = window.localStorage;
	}

    function getOrElse(field, otherwise) {
        return function() {
            var t = localStorage[field];
            return t ? t : otherwise;
        }
    }

    function setOrClear(field) {
        return function(value) {
            if (value.length === 0)
                delete localStorage[field];
            else
                localStorage[field] = value;
        }
    }

	return {
        getIsLoggedIn: getOrElse('logged_in', false),

		getFederationServer: getOrElse('federation_server', 'http://federation.lostd.com'),

		setFederationServer: setOrClear('federation_server'),

		getDatabaseURL: getOrElse('database_url', ''),

		setDatabaseURL: setOrClear('database_url')
	};



});