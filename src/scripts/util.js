'use strict';

define(['assert'], function(assert) {

    return {
        formatRecordType: function(type) {
            switch (type) {
                case 'owes_me': //+ Someone owes me x money
                    return 'Owed'; 
                case 'i_paid': //+ I send someone mone so he owes me
                    return 'Paid'; 
                case 'paid_me': //- E.g. They send me x, so i owe them
                    return 'Received'; 
                case 'i_owe': 
                    return 'Owe'; //- I Owe someone x money
                default:
                    assert(!'Type of transaction not found: ' + type);
            }
        },
        formatNumber: function(num) {
            assert(typeof num === 'number')
            return parseFloat(num).toFixed(2);
        }
    }
});