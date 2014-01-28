'use strict';

define(['pouchdb-nightly', 'settings'], function(PouchDb, Settings) {

    var db = new PouchDb('lostd');


    function continuousReplication() {

        var cancel = false;

        var dbUrl = Settings.getDatabaseURL();
        if (dbUrl) {
            console.log('Replication to ', dbUrl, ' has begun');

            var importPromise = continuousImport();
            var exportPromise = continuousExport();


            return {
                cancel: function() {
                    console.log('Canceling Replication..');
                    cancel = true;
                    importPromise.cancel();
                    exportPromise.cancel();
                }
            };
        } else {
            return { cancel: function(){ cancel = true } };
        }

        function continuousImport() {
            if (cancel) return;
            console.log('Starting import... from: ', dbUrl);
            return db.replicate.from(dbUrl, { continuous: true }, function(err) {
                console.log('Resetting continuous import...', err);
                if (!err)
                    Settings.setLastImport(new Date());
                window.setTimeout(continuousImport, 2000);
            });
        }

        function continuousExport() {
            if (cancel) return;
            console.log('Starting export... to: ', dbUrl);
            return db.replicate.to(dbUrl, { continuous: true }, function(err) {
                console.log('Resetting continuous export...', err);
                if (!err)
                    Settings.setLastExport(new Date());
                window.setTimeout(continuousExport, 2000);
            });
        }
    }

    var promise = continuousReplication();

    return {

        cancel: function() {
            promise.cancel();
        },

        restartReplication: function() {
            console.log('Restarting replication..');
            promise.cancel();
            promise = continuousReplication();
        },

        onChange: function(f) {
            return db.changes({ since: 'latest', continuous: true, include_docs: true, onChange: f });
        },

        sync: function(importCallback, exportCallback, doneCallback) {
            var dbUrl = Settings.getDatabaseURL();
            console.log('Syncing to ', dbUrl);

            var remaining = 2;
            var lastErr;

            db.replicate.from(dbUrl, function(err) {
                console.log('Finished importing from ', dbUrl);

                Settings.setLastImport(new Date());

                importCallback(err);
                if (--remaining == 0)
                    doneCallback(lastErr || err);
                else
                    lastErr = err;
            });

            db.replicate.to(dbUrl, function(err) {
                console.log('Finished exporting to ', dbUrl);

                Settings.setLastExport(new Date());

                exportCallback(err);
                if (--remaining == 0)
                    doneCallback(lastErr || err);
                else
                    lastErr = err;
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