'use strict';

define(['assert', 'pouchdb-nightly', 'settings'], function(assert, PouchDb, Settings) {

    var db = new PouchDb('lostd');

    function continuousReplication() {

        var cancel = false;

        var dbUrl = Settings.get('database_url');
        if (!dbUrl) return;

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


        function continuousImport() {
            if (cancel) return;
            console.log('Starting import... from: ', dbUrl);
            return db.replicate.from(dbUrl, { continuous: true }, function(err) {
                if (!err)
                    Settings.set('last_import', new Date());

                if (cancel) return;
                console.log('Resetting continuous import...', err);

                window.setTimeout(continuousImport, 2000);
            });
        }

        function continuousExport() {
            if (cancel) return;
            console.log('Starting export... to: ', dbUrl);
            return db.replicate.to(dbUrl, { continuous: true }, function(err) {
                if (!err)
                    Settings.set('last_export', new Date());

                if (cancel) return;
                console.log('Resetting continuous export...', err);

                window.setTimeout(continuousExport, 2000);
            });
        }
    }

    var promise = continuousReplication();

    return {

        cancel: function() {
            if (promise) {
                promise.cancel();
                promise = null;
            }
        },

        restartReplication: function() {
            if (promise) promise.cancel();
            promise = continuousReplication();
        },

        destroy: function(callback) {
            if (promise) promise.cancel();
            PouchDb.destroy('lostd', function(err, response) {
                console.log('Result of destroy... ', err, response);
                db = new PouchDb('lostd');
                promise = continuousReplication();
                callback(err);
            });
        },

        deleteAll: function(callback) {
            db.allDocs({include_docs: true }, function (err, response) {
                assert(response['total_rows'] === response.rows.length);

                var docs = response.rows.map(function (x) {
                    x.doc['_deleted'] = true;
                    return x.doc;
                });

                db.bulkDocs({ docs: docs }, callback);
            });
        },

        onChange: function(onChange) {
            return db.changes({ since: 'latest', continuous: true, include_docs: true, onChange: onChange });
        },

        exportTo: function(dbUrl, callback) {
            return db.replicate.to(dbUrl, function(err) {
                console.log('Finished exporting to ', dbUrl, ' with error: ', err);

                if (!err)
                    Settings.set('last_export', new Date());

                callback(err);
            });
        },

        importFrom: function(dbUrl, callback) {
            return db.replicate.from(dbUrl, function(err) {
                console.log('Finished import from ', dbUrl, ' with error: ', err);

                if (!err)
                    Settings.set('last_import', new Date());

                callback(err);
            });
        },

        sync: function(dbUrl, callback) {
            console.log('Syncing to ', dbUrl);

            var remaining = 2;
            var lastErr;

            db.replicate.from(dbUrl, { batch_size: 500 }, function(err) {
                console.log('Finished importing from ', dbUrl);

                Settings.set('last_import', new Date());

                if (--remaining == 0)
                    callback(lastErr || err);
                else
                    lastErr = err;
            });

            db.replicate.to(dbUrl, { batch_size: 500 }, function(err) {
                console.log('Finished exporting to ', dbUrl);

                Settings.set('last_export', new Date());

                if (--remaining == 0)
                    callback(lastErr || err);
                else
                    lastErr = err;
            });

        },

        docsCount: function(callback) {
            db.info(function(err,resp) {
                if (err) return callback(err);
                callback(null, resp['doc_count']);
            });
        },

        addContact: function(name, description, lostdAddress, publicKey, callback) {
            db.post(
                {
                    type: 'contact',
                    name: name,
                    lostd_address: lostdAddress,
                    public_key: publicKey,
                    description: description,
                    created: Date.now()
                },
                callback
            );
        },

        updateContact: function(contact, callback) {
            db.put(contact, callback)
        },

        addRecord: function(contact, record_type, amount, currency, description, callback) {
            db.post(
                {
                    type: 'record',
                    contact: contact,
                    record_type: record_type,
                    amount: amount,
                    currency: currency,
                    description: description,
                    created: Date.now()
                },
                callback()
            )
        },

        // This function deletes the user, and all associated documents
        deleteContact: function(userId, callback) {
            var map = function(doc, emit) {
                if (doc.type === 'contact' && doc._id === userId)
                    emit({ _id: doc._id, _rev: doc._rev, _deleted: true });
                else if (doc.type === 'record' && doc.contact === userId)
                    emit({ _id: doc._id, _rev: doc._rev, _deleted: true});
            }

            db.query({ map: map}, function(err, response) {
                if (err) return callback(err);

                var bulkQuery = response.rows.map(function(x) {
                    return x.key;
                });

                db.bulkDocs({ docs: bulkQuery }, callback);
            });

        },

        remove: db.remove.bind(db),

        query: function(mapFunction, callback) {
            db.query({ map: mapFunction}, callback);
        },

        db: db

    };
});