'use strict';

define(['assert', 'react', 'widgets/tab', 'widgets/query_mixin'], function(assert, React, Tab, QueryMixin) {

    var mixin = QueryMixin(function(doc) {
        if (doc.type === 'tab')
            emit('tab', doc);
        else if (doc.type === 'debt') {
            var amount = doc.amount;
            if (doc.direction === 'outgoing')
                amount *= -1;
            emit('debt', [doc.tab, amount, doc.currency]);
        }
    });

    return React.createClass({
        displayName: 'AccountList',

        mixins: [mixin],

        render: function() {
            var self = this;

            var tabInfo = {};

            self.forEachKV(function (k,v) {

                if (k === 'debt') {
                    var id = v[0];
                    var amount = v[1];
                    var currency = v[2];

                    if (!(id in tabInfo))
                        tabInfo[id] = [null, {}]; // tab info, currency-debts

                    var currencyDebts = tabInfo[id][1];
                    if (!(currency in currencyDebts))
                        currencyDebts[currency] = amount;
                    else
                        currencyDebts[currency] += amount;
                } else {
                    assert(k === 'tab');
                    var id = v._id;

                    if (!(id in tabInfo))
                        tabInfo[id] = [v, {}]; // tab info, currency-debts
                    else
                        tabInfo[id][0] = v;
                }
            });

            var list = [];
            Object.keys(tabInfo).forEach(function(id) {
                var tab = tabInfo[id][0];
                var currencies = tabInfo[id][1];

                if (!tab)
                    return console.warn('Could not find any tab for ', id, ' but have debts for it ', currencies);

                console.log(tabInfo[id]);

                list.push(Tab({ key: tab._id, object: tab, currencies: currencies }));
            });

            var component;

            if (this.state.ready && list.length === 0) {
                component =  React.DOM.p(null, 'You have no tabs! You should add one!');
            } else {
                component = list;
            }

            return React.DOM.div(null,
                React.DOM.h2(null, 'All Tabs'),
                component);
        }
    });


})