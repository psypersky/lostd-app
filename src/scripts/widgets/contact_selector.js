'use strict';

define(['assert', 'react', 'database', 'widgets/query_mixin'], function(assert, React, Database, QueryMixin) {

    return React.createClass({
        displayName: 'ContactSelector',

        mixins: [QueryMixin(function(doc) {
            if (doc.type === 'contact')
                emit(doc._id, doc);
        })],

        propTypes: {
            onSelectedChange: React.PropTypes.func.isRequired
        },

        onChange: function() {
            var selected = this.refs['contactDropDown'].getDOMNode();
            var contactId = selected.options[selected.selectedIndex].value;

            var contact;

            if (contactId === '')
                contact = null;
            else {
                assert(this.state[contactId].length === 2);
                contact = this.state[contactId][1][1];
            }

            this.props.onSelectedChange(contact);
        },

        render: function() {
            var self = this;

            var list = [];

            this.forEachKV(function(key, value) {
                list.push(React.DOM.option({ key: key, value: key }, value.name));
            });

            list.unshift(React.DOM.option({ key: 'NA', value: '' }, '-Select a Contact-'));

            return React.DOM.select({ ref: 'contactDropDown', required: true, onChange: self.onChange }, list);
        }


    });
});