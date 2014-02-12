'use strict';

define(['react', 'widgets/query_mixin'], function(React, QueryMixin) {

    return React.createClass({
        displayName: 'RecordList',

        mixins: [QueryMixin(function(doc, emit) {
            if (doc.type === 'record')
                emit(doc._id, doc);
            })],

        render: function() {

            var self = this;

            var list = [];

            this.forEachKV(function(key, value) {

                list.push(React.DOM.tr({ key: key },
                    React.DOM.td(null, value.contact),
                    React.DOM.td(null, value.record_type),
                    React.DOM.td(null, value.amount),
                    React.DOM.td(null, value.currency),
                    React.DOM.td(null, value.description)
                ));

            });


//            if (this.state.ready && list.length === 0) {
//                return React.DOM.p(null,
//                    'You have no records! Perhaps you should add some!'
//                );
//            }

            list.unshift(React.DOM.tr({ key: 'header' },
                React.DOM.th(null, 'Contact'),
                React.DOM.th(null, 'Type'),
                React.DOM.th(null, 'Amount'),
                React.DOM.th(null, 'Currency'),
                React.DOM.th(null, 'Description')
            ));

            return React.DOM.div(null,
                React.DOM.h2(null, 'Record Info'),
                React.DOM.table({ id: 'infoTable' }, list)
            );
        }
    });


})