'use strict';


define(function() {

    return function(condition) {
        if (!condition)
            throw new Error('Assertion failure!');
    }
});