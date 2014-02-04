'use strict';

define(['react', 'database'], function(React, Database) {

    return React.createClass({
        displayName: 'Account',

        getInitialState: function() {
            return { error: null, isDeleting: false };
        },

        propTypes: {
            object: React.PropTypes.object.isRequired,
            currencies: React.PropTypes.object.isRequired
        },

        render: function() {
            var self = this;

            var credit = [];
            var debit = [];

            for (var currency in this.props.currencies) {
                var value = this.props.currencies[currency];
                if (value > 0)
                    credit.push(React.DOM.p({ key: currency }, currency, ': ', value));
                else if (value < 0)
                    debit.push(React.DOM.p({ key: currency }, currency, ': ', -1 * value));
            }

            function sortByKey(a, b) {
                if (a.key < b.key) return -1;
                return 1;
            }

            credit.sort(sortByKey);
            debit.sort(sortByKey);

            var owesYouWidget = null;


            return React.DOM.div({ className: 'account' },
                React.DOM.h3(null, this.props.object.name),
                (this.state.error ? React.DOM.p({ className: 'errorText' }, this.state.error) : null),
                React.DOM.p(null, this.props.object.description),
                (credit.length > 0 ? React.DOM.h4(null, 'Owes you:') : null),
                credit,
                (debit.length > 0 ? React.DOM.h4(null, 'You owe:') : null),
                debit,
                React.DOM.input({type: 'button', value: 'Delete!', disabled: (this.state.isDeleting || this.state.error ), onClick: this.onDelete })
            );
        },

        onDelete: function() {
            console.log('Trying to delete ', this.props.object);
            this.setState({ isDeleting: true });

            var self = this;

            Database.remove(self.props.object, function(err, response) {
                console.log('Removed doc: ', self.props.key, ' with response ', err, ' -- ', response);

                if (self.isMounted()) {
                    if (err) {
                        self.setState({ isDeleting: false, error: err.toString() });
                    }
                }
            });


        }
    });

});
