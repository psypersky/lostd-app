'use strict';

// The read part of settings is split into '_ro' to break the circular dependency with database

define(function() {

    var localStorage;

    if (!window.localStorage) {
        console.error('Browser does not support local storage. Settings will not persist..');
        window.localStorage = {};
    }
    localStorage = window.localStorage;

    function getOrElse(field, otherwise) {
        return function() {
            var t = localStorage[field];
            return t ? t : otherwise;
        }
    }

    var listenMap = {};

    function set(field) {
        return function(value) {
            if (value === undefined)
                delete localStorage[field];
            else {
                if (localStorage[field] !== value) {

                    var listeners = listenMap[field] || {};

                    Object.keys(listeners).forEach(function (key) {
                        listeners[key](value);
                    });

                    localStorage[field] = value;
                }
            }
        }
    }

    // Add a listener function to a specific key. This function will be called with the new value *before* any change happens
    function listen(key) {
        return function(fn) {
            if (key in listenMap) {
                var listeners = listenMap[key];
                var counter = ++listeners['counter'];
                listeners[counter] = fn;
                return { cancel: function() { delete listeners[counter]; }}
            } else {
                var o = { '0': fn };
                Object.defineProperty(o, 'counter', {
                    configurable: true,
                    enumerable: false,
                    value: 0,
                    writable: true
                });
                listenMap[key] = o;
                return { cancel: function() { delete listenMap[key][0]; }}
            }
        }
    }

    return {
        getIsLoggedIn: getOrElse('is_logged_in', false),
        setIsLoggedIn: set('is_logged_in'),
        listenIsLoggedIn: listen('is_logged_in'),

        getLastImport: getOrElse('last_import', undefined),
        setLastImport: set('last_import'),
        listenLastImport: listen('last_import'),

        getLastExport: getOrElse('last_export', undefined),
        setLastExport: set('last_export'),
        listenLastExport: listen('last_export'),

        getFederationServer: getOrElse('federation_server', 'http://federation.lostd.com'),
        setFederationServer: set('federation_server'),
        listenFederationServer: listen('federation_server'),

        getDatabaseURL: getOrElse('database_url', undefined),
        setDatabaseURL: set('database_url'),
        listenDatabaseURL: listen('database_url')
    };



});