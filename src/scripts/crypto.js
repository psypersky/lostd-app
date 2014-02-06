'use strict';

define(['sjcl'], function(sjcl) {

    function hash(str) {
        var bits = sjcl.hash.sha256.hash(str);
        return sjcl.codec.hex.fromBits(bits);
    }

    return {
        hash: hash
    };
});