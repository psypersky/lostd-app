'use strict';

define(['assert', 'react', 'widgets/contact_row', 'widgets/query_mixin', 'util'],
    function(assert, React, ContactRow, QueryMixin, Util) {

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
            changeContactsWidget: React.PropTypes.func.isRequired
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

            //Create an array of tr's for each contact in list
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
                                self.props.changeContactsWidget(contact)
                            }
                        }
                    ));
            });

            var content;
            if (this.state.ready && list.length === 0) {
                content = React.DOM.p(null, 'You have no contacts! You should add one!');
            } else { //Create a table with the totals of each currency for each user
                
                var totals;
                var tableHead;

                var thTitles = [];
                var thTotals = [];
                
                for ( var currency in allCurrencies) {
                    thTitles.push(React.DOM.th({ key: 'th_' + currency }, currency));
                    thTotals.push(React.DOM.td({ key: 'th_' + currency + 'qty' }, Util.formatNumber(allCurrencies[currency])));
                }
                if (thTitles.length > 0) {
                    thTitles.unshift(React.DOM.th({ key: 'th_iser' }, 'User'));
                    thTotals.unshift(React.DOM.th({ key: 'total' }, 'Total:'));

                    tableHead = React.DOM.thead(null,
                                        React.DOM.tr(null, thTitles));
                    totals = React.DOM.tr({ id: 'total_row'}, thTotals);
                }
                
                content = React.DOM.table(null,
                                    tableHead,
                                    React.DOM.tbody(null, list, totals)
                                 );
            }

            return React.DOM.div({ className: 'contact_list' },
                        content
                    );
        }
    });


})