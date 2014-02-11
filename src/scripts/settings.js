'use strict';

// The read part of settings is split into '_ro' to break the circular dependency with database

define(function() {

    var localStorage;

    if (!window.localStorage) {
        console.error('Browser does not support local storage. Settings will not persist..');
        window.localStorage = {};
    }
    localStorage = window.localStorage;

    var listenMap = {};

    function get(field) {
        return localStorage[field];
    }

    function getOrElse(field, otherwise) {
        var t = localStorage[field];
        return t ? t : otherwise;
    }

    function set(field, value) {
        var listeners = listenMap[field] || {};

        Object.keys(listeners).forEach(function (key) {
            listeners[key](value);
        });

        localStorage[field] = value;
    }

    function remove(field) {
        set(field, undefined); // Give listeners a heads-up
        delete localStorage[field];
    }

    // Add a listener function to a specific key. This function will be called with the new value *before* any change happens
    function listen(key, fn) {
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


    return {
        keys: null, // Store public/private keys
        get: get,
        getOrElse: getOrElse,
        set: set,
        remove: remove,
        listen: listen
    };



});