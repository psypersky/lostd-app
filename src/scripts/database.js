'use strict';

define(['pouchdb-nightly', 'settings'], function(PouchDb, Settings) {

    var db = new PouchDb('lostd');

    console.log('Creating database!!!');

    function continuousReplication() {

        var cancel = false;

        var dbUrl = Settings.getDatabaseURL();
        if (dbUrl) {
            var importPromise = continuousImport();
            var exportPromise = continuousExport();


            return {
                cancel: function() {
                    console.log('Canceling Replication..');
                    importPromise.cancel();
                    exportPromise.cancel();
                }
            };
        } else {
            return { cancel: function(){} };
        }

        function continuousImport() {
            if (cancel) return;
            console.log('Starting import... from: ', dbUrl);
            return db.replicate.from(dbUrl, {
                continuous: true,
                complete: function() {
                    console.log('Resetting continuous import...');
                    window.setTimeout(continuousImport, 2000);
                },
                onChange: function(change) {
                    console.log('Imported a change: ', change);
                }
            });
        }

        function continuousExport() {
            if (cancel) return;
            console.log('Starting export... to: ', dbUrl);
            return db.replicate.to(dbUrl, {
                continuous: true,
                complete: function() {
                    console.log('Resetting continuous export...');
                    window.setTimeout(continuousExport, 2000);
                },
                onChange: function(change) {
                    console.log('Exported a change: ', change);
                }
            });
        }
    }

    var promise = continuousReplication();

    return {

        onChange: function(f) {
            return db.changes({ since: 'latest', continuous: true, include_docs: true, onChange: f });
        },

        sync: function() {
            console.log('Syncing...');
            db.replicate.to(Settings.getDatabaseURL(), {
                complete: function() {
                    console.log('Finished replicating TO remote!');
                }
            });
            db.replicate.from(Settings.getDatabaseURL(), {
                complete: function() {
                    console.log('Finished replicating FROM remote');
                }
            });
        },

        addAccount: function(name, description, callback) {
            db.post(
                {
                    type: 'account',
                    name: name,
                    description: description,
                    created: new Date()
                },
                callback);
        },

        remove: db.remove.bind(db),

        query: function(mapFunction, callback) {
            db.query({ map: mapFunction}, callback);
        }

    };
});