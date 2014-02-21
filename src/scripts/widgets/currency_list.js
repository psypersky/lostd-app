'use strict';

define(['react', 'widgets/query_mixin'], function(React, QueryMixin){

    var mixin = QueryMixin(function(doc, emit) {
        if (doc.type === 'currency')
            emit(doc._id, doc);
    });

    return React.createClass({

        displayName: 'CurrencyList',

        mixins: [mixin],

        showCurrency: function(k) {
            return function(){
                console.log('showCurrency called', k);
            }
        },

        render: function() {
            var R = React.DOM;
            var self = this;
            var currencyList = [];
            this.forEachKV(function (k,v) {
                currencyList[k] = v;
                currencyList.push(
                    R.li(null,
                        R.a({onClick: self.showCurrency(k)}, v.name)
                    )
                );
                console.log('Currency', k, v.name);
            });

            return (
                R.div({className: 'cl_container'},
                    R.div({className: 'row'},
                        R.div({className: 'large-12 columns'},
                            R.ul(null,
                                currencyList
                            )
                        )
                    )
                )
            );
        }

    });
});