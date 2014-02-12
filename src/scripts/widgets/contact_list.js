'use strict';

define(['assert', 'react', 'widgets/contact_row', 'widgets/query_mixin'], function(assert, React, ContactRow, QueryMixin) {

    var mixin = QueryMixin(function(doc, emit) {
        if (doc.type === 'contact')
            emit('contact', doc);
        else if (doc.type === 'record')
            emit('record', [doc.contact, doc.amount, doc.currency]);
        
    });

    return React.createClass({
        displayName: 'ContactList',

        mixins: [mixin],

        propTypes: {
            showContact: React.PropTypes.func.isRequired
        },
        
        render: function() {
            var self = this;
            var contactInfo = {};
            var allCurrencies = {};

            self.forEachKV(function (k,v) {

                if (k === 'record') {
                    var id = v[0];
                    var amount = v[1];
                    var currency = v[2];

                    if (!(id in contactInfo))
                        contactInfo[id] = [null, {}]; // contact info, currency-amount

                    if (currency in allCurrencies)
                        allCurrencies[currency] += amount;
                    else
                        allCurrencies[currency] = amount;

                    var currencyAmounts = contactInfo[id][1];
                    if (currency in currencyAmounts)
                        currencyAmounts[currency] += amount;
                    else
                        currencyAmounts[currency] = amount;
                } else {
                    assert(k === 'contact');
                    var id = v._id;

                    if (!(id in contactInfo))
                        contactInfo[id] = [v, {}]; // contact info, currency-amounts
                    else
                        contactInfo[id][0] = v;
                }
            });

            var list = [];
            Object.keys(contactInfo).forEach(function(id) {
                var contact = contactInfo[id][0];
                var currencies = contactInfo[id][1];

                if (!contact)
                    return console.warn('Could not find any contact for ', id, ' but have records for it ', currencies);

                list.push(
                    ContactRow(
                        {
                            key: contact._id,
                            object: contact,
                            currencyAmounts: currencies,
                            allCurrencies: allCurrencies,
                            onClick: function() {
                                self.props.showContact(contact)
                            }
                        }
                    ));
            });

            var component;
            if (this.state.ready && list.length === 0) {
                component = React.DOM.p(null, 'You have no contacts! You should add one!');
            } else {
                component = list;
            }

            var thTitles = [];
            thTitles.push(React.DOM.th({ key: 'th_' + 'empty_title' }, ''));
            var thTotals = [];
            thTotals.push(React.DOM.th({ key: 'th_' + 'total' }, 'Total'));
            for( var currency in allCurrencies){
                thTitles.push(React.DOM.th({ key: 'th_' + currency }, currency));
                thTotals.push(React.DOM.th({ key: 'th_' + currency + 'qty' }, allCurrencies[currency]));
            }

            return React.DOM.div({ className: 'contact_list' },
                        React.DOM.table(null,
                            React.DOM.thead(null,
                                React.DOM.tr(null, thTitles),
                                React.DOM.tr(null, thTotals)),
                            React.DOM.tbody(null, component)
                        )
                    );
        }
    });


})