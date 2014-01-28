'use strict';

define(['react', 'database', 'widgets/account'], function(React, Database, Account) {

    return React.createClass({
        displayName: 'AccountList',

        getInitialState: function() {
            return { data: {}, isLoaded: false };
        },

        dbChangeListener: function(change) {
            if (!this.isMounted()) return;

            console.log('Account list change listener: ', change);

            if (change['deleted'] === true && (change.id in this.state.data)) {

                var copy = {};
                for (var x in this.state.data) {
                    if (x !== change.id)
                        copy[x] = this.state.data[x];
                }
                return this.setState({ data: copy });
            } else if (change.doc.type === 'account') {
                var copy = {};
                for (var x in this.state.data) {
                    copy[x] = this.state.data[x];
                }
                copy[change.id] = change.doc;
                return this.setState({ data: copy });
            }

        },

        promise: null,

        componentWillMount: function() {
            var self = this;

            function map(doc) {
                if (doc.type === 'account')
                    emit(doc._id, doc);
            }

            Database.query(map, function(err, response) {

                console.log('Response: ', response);

                var data = {};

                response.rows.forEach(function (x) {
                    data[x.key] = x.value;
                });

                self.setState({
                    data: data,
                    isLoaded: true
                });

            });

            this.promise = Database.onChange(this.dbChangeListener);
        },

        componentWillUnmount: function() {
              if (this.promise) {
                  this.promise.cancel();
              }
        },

        render: function() {
            var self = this;

            if (this.state.isLoaded && Object.keys(self.state.data).length === 0) {
                return React.DOM.p(null,
                    'You have no accounts! You should add one!'
                );
            }

            var list = Object.keys(self.state.data).map(function (k) {
                var value = self.state.data[k];

                return Account({ key: k, rev: value._rev, name: value.name, description: value.description });
            });

            return React.DOM.div(null, list);
        }
    });



})