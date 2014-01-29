'use strict';

// Provide a constantly updated list of X
// sets dbList and dbListLoaded
define(['react', 'database'], function(React, Database) {

    return function(what) {
        return {
            componentWillMount: function() {
                var self = this;


                var map = new Function('doc',
                    'if (doc.type === ' + JSON.stringify(what) + ')' +
                        'emit(doc._id, doc);'
                );

                Database.query(map, function(err, response) {
                    var data = {};

                    response.rows.forEach(function (x) {
                        data[x.key] = x.value;
                    });

                    if (self.isMounted())
                        self.setState({
                            dbList: data,
                            dbListLoaded: true
                        });


                });

                this.promise = Database.onChange(this.dbChangeListener);
            },

            dbChangeListener: function(change) {
                if (!this.isMounted()) return;

                if (change['deleted'] === true && (change.id in this.state.dbList)) {

                    var copy = {};
                    for (var x in this.state.dbList) {
                        if (x !== change.id)
                            copy[x] = this.state.dbList[x];
                    }
                    return this.setState({ dbList: copy });
                } else if (change.doc.type === 'account') {
                    var copy = {};
                    for (var x in this.state.dbList) {
                        copy[x] = this.state.dbList[x];
                    }
                    copy[change.id] = change.doc;
                    return this.setState({ dbList: copy });
                }
            },

            componentWillUnmount: function() {
                if (this.promise)
                    this.promise.cancel();
            }
        }
    }
});