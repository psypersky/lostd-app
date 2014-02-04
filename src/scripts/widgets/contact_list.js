'use strict';

define(['assert', 'react', 'widgets/contact', 'widgets/query_mixin'], function(assert, React, Contact, QueryMixin) {

    var mixin = QueryMixin(function(doc) {
        if (doc.type === 'contact')
            emit('contact', doc);
        else if (doc.type === 'debt') {
            var amount = doc.amount;
            if (doc.direction === 'outgoing')
                amount *= -1;
            emit('debt', [doc.contact, amount, doc.currency]);
        }
    });

    return React.createClass({
        displayName: 'AccountList',

        mixins: [mixin],

        render: function() {
            var self = this;

            var contactInfo = {};

            self.forEachKV(function (k,v) {

                if (k === 'debt') {
                    var id = v[0];
                    var amount = v[1];
                    var currency = v[2];

                    if (!(id in contactInfo))
                        contactInfo[id] = [null, {}]; // contact info, currency-debts

                    var currencyDebts = contactInfo[id][1];
                    if (!(currency in currencyDebts))
                        currencyDebts[currency] = amount;
                    else
                        currencyDebts[currency] += amount;
                } else {
                    assert(k === 'contact');
                    var id = v._id;

                    if (!(id in contactInfo))
                        contactInfo[id] = [v, {}]; // contact info, currency-debts
                    else
                        contactInfo[id][0] = v;
                }
            });

            var list = [];
            Object.keys(contactInfo).forEach(function(id) {
                var contact = contactInfo[id][0];
                var currencies = contactInfo[id][1];

                if (!contact)
                    return console.warn('Could not find any contact for ', id, ' but have debts for it ', currencies);

                list.push(Contact({ key: contact._id, object: contact, currencies: currencies }));
            });

            var component;

            if (this.state.ready && list.length === 0) {
                component =  React.DOM.p(null, 'You have no contacts! You should add one!');
            } else {
                component = list;
            }

            return React.DOM.div(null,
                React.DOM.h2(null, 'All Contacts'),
                component);
        }
    });


})