'use strict';

// Provide a constantly updated list of accounts
// sets accountList and accountListLoaded
define(['react', 'database'], function(React, Database) {

    return {
        componentWillMount: function() {
            var self = this;

            function map(doc) {
                if (doc.type === 'account')
                    emit(doc._id, doc);
            }

            Database.query(map, function(err, response) {

                var data = {};

                response.rows.forEach(function (x) {
                    data[x.key] = x.value;
                });

                self.setState({
                    accountList: data,
                    accountListLoaded: true
                });

            });

            this.promise = Database.onChange(this.dbChangeListener);
        },

        dbChangeListener: function(change) {
            if (!this.isMounted()) return;

            console.log('Account list change listener: ', change);

            if (change['deleted'] === true && (change.id in this.state.accountList)) {

                var copy = {};
                for (var x in this.state.accountList) {
                    if (x !== change.id)
                        copy[x] = this.state.accountList[x];
                }
                return this.setState({ accountList: copy });
            } else if (change.doc.type === 'account') {
                var copy = {};
                for (var x in this.state.accountList) {
                    copy[x] = this.state.accountList[x];
                }
                copy[change.id] = change.doc;
                return this.setState({ accountList: copy });
            }

        },

        componentWillUnmount: function() {
            if (this.promise)
                this.promise.cancel();
        }
    }
});