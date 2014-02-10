'use strict';

define(['assert', 'sjcl'], function(assert, sjcl) {

    function hash(str) {
        var bits = sjcl.hash.sha256.hash(str);
        return sjcl.codec.hex.fromBits(bits);
    }



//    function h(str) {
//        return sjcl.hash.sha256.hash(str);
//    }

//    var signature = sec.sign('chicken');
//
    //console.log('Public key', pub, pub._point.toBits());
   // console.log('Verifiy: ', pub.verify('chickenz', signature));


    var curve = sjcl.ecc.curves.k256;
    function generateKeys() {
        return sjcl.ecc.ecdsa.generateKeys(curve);
    }

    function format(bits) {
        return sjcl.codec.base64.fromBits(bits, true, true);
    }

    function formatPublicKey(key) {
        return format(key._point.toBits());
    }

    function formatPrivateKey(key) {
        return format(key.get());
    }

    function parse(str) {
        return sjcl.codec.base64.toBits(str, true);
    }

    function parsePublicKey(str) {
        return new sjcl.ecc.ecdsa.publicKey(curve, parse(str));
    }

    function parsePrivateKey(str) {
        throw new Error('TODO: parsePrivateKey');
    }

    // Intrusively signs an object. Adds a new 'signature' field
    function signObject(obj, keys) {
        assert(!('signature' in obj));

        var hash = sjcl.hash.sha256.hash(JSON.stringify(obj));

        obj['signature'] = {
            public_key: formatPublicKey(keys.pub),
            data: format(keys.sec.sign(hash)),
            type: 'sha256/ecdsa'
        };
    }

    function isValidSignatureObject(obj) {
        var signature = obj['signature'];
        if (!signature) {
            console.warn('Object', obj, 'was not signed');
            return false;
        }
        if (signature.type !== 'sha256/ecdsa') {
            console.warn('Unreckognized signature: ', signature.type);
            return false;
        }

        try {
            var pub = parsePublicKey(signature.public_key);

            delete obj['signature']; // Temporarily remove the signature
            var hash = sjcl.hash.sha256.hash(JSON.stringify(obj));
            obj['signature'] = signature; // Re-add it


            return pub.verify(hash, parse(signature.data));
        } catch (ex) {
            console.warn('Invalid signature of ', obj, ' gave exception ', ex);
            return false;
        }
    }

    return {
        generateKeys: generateKeys,
        formatPublicKey: formatPublicKey,
        formatPrivateKey: formatPrivateKey,
        parsePublicKey: parsePublicKey,
        parsePrivateKey: parsePrivateKey,
        hash: hash,
        signObject: signObject,
        isValidSignatureObject: isValidSignatureObject,
        passwordHash: function(username, password) {
            return hash(username + '/' + password).substring(0,12);
        }
    };
});