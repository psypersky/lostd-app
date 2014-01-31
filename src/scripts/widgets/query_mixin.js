'use strict';

// Provide a constantly updated list of X
// sets dbList and dbListLoaded
define(['react', 'database'], function(React, Database) {

    return function(mapFn) {

        var emitResults = ['_kvs_'];
        function emit(k, v) {
            console.log('Emit is being called...', k, v);
            emitResults.push([k,v]);
        }

        var boundFn;
        eval('boundFn = ' + mapFn.toString() + ';'); // ewww :P [Bind emit]


        return {
            displayName: 'QueryMixin',

            getInitialState: function() {
                return { ready: false }
            },

            forEachKV: function(fn) {
                var self = this;

                Object.keys(self.state).forEach(function (id) {
                    var kvs = self.state[id];

                    if (Array.isArray(kvs) && kvs[0] === '_kvs_') {

                        for (var i = 1 ; i < kvs.length ; ++i) {
                            var kv = kvs[i];
                            fn(kv[0], kv[1]);
                        }
                    }
                });

            },

            componentWillMount: function() {
                var self = this;

                Database.query(mapFn, function(err, response) {
                    var data = { ready: true };  // { id: [[k,v], [k,v], [k,v]]

                    response.rows.forEach(function (x) {
                        if (x.id in data) {
                            data[x.id].push([x.key, x.value]);
                        } else {
                            data[x.id] = ['_kvs_', [x.key, x.value]];
                        }
                    });

                    self.setState(data);

                });

                this.promise = Database.onChange(this.dbChangeListener);
            },

            dbChangeListener: function(change) {
                console.log('Found change: ', change);

                if (!this.isMounted()) return;

                var op = {};
                op[change.id] = undefined;

                if (change['deleted'] === true && (change.id in this.state)) {
                    this.setState(op);
                } else if (!change['deleted']) {
                    boundFn(change.doc);
                    if (emitResults.length != 0) {
                        op[change.id] = emitResults;
                        emitResults = ['_kvs_'];
                    }

                    this.setState(op);
                }
            },

            componentWillUnmount: function() {
                console.log('Canceling subscription', this.promise);
                this.promise.cancel();
            }
        };
    }
});