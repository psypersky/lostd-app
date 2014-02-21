'use strict';

define(['pouchdb-nightly'], function(PouchDb) {

    var db = new PouchDb('lostd');
    var databaseUrl;

    function continuousReplication() {
        if (!databaseUrl) return;

        var cancel = false;

        console.log('Replication to ', databaseUrl, ' has begun');

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
            console.log('Starting import... from: ', databaseUrl);
            return db.replicate.from(databaseUrl, { continuous: true }, function(err) {
                if (cancel) return;
                window.setTimeout(continuousImport, 2000);
            });
        }

        function continuousExport() {
            if (cancel) return;
            console.log('Starting export... to: ', databaseUrl);
            return db.replicate.to(databaseUrl, { continuous: true }, function(err) {
                if (cancel) return;
                window.setTimeout(continuousExport, 2000);
            });
        }
    }

    var promise = null;

    function cancel() {
        if (promise) {
            promise.cancel();
            promise = null;
        }
    }

    function replicate() {
        cancel();
        var done = false;
        promise = db.replicate.sync(databaseUrl, {
            continuous: true,
            complete: function(err) {
            if (done) // HACK: see pouchdb issue 1409
                callback(err);
            else
                done = !done;
        }});
    }

    return {
        cancel: cancel,
        replicate: replicate,

        destroy: function(callback) {
            cancel();
            PouchDb.destroy('lostd', function(err, response) {
                db = new PouchDb('lostd');
                callback(err);
            });
        },

        setDatabaseUrl: function(dbUrl) {
            databaseUrl = dbUrl;
            if (promise) { // If already replicating
                replicate(); // cancels and restarts
            }
        },

        // Calls callback with: err, amount of docs deleted
        deleteAll: function(callback) {
            db.allDocs({include_docs: true }, function (err, response) {
                console.assert(response['total_rows'] === response.rows.length);

                var docs = response.rows.map(function (x) {
                    x.doc['_deleted'] = true;
                    return x.doc;
                });

                db.bulkDocs({ docs: docs }, function(err) {
                    if (err) return callback(err);
                    callback(null, response['total_rows']);
                });
            });
        },

        onChange: function(onChange) {
            return db.changes({ since: 'latest', continuous: true, include_docs: true, onChange: onChange });
        },

        importSync: function(callback) {
            cancel();
            db.replicate.from(databaseUrl, { complete: callback });
        },

        exportSync: function(callback) {
            cancel();
            db.replicate.to(databaseUrl, { complete: callback });
        },

        sync: function(callback) {
            cancel();
            var done = false;
            db.replicate.sync(databaseUrl, { complete: function(err) {
                if (done) // HACK: see pouchdb issue 1409
                    callback(err);
                else
                    done = !done;
            }});
        },

        docsCount: function(callback) {
            db.info(function(err,resp) {
                if (err) return callback(err);
                callback(null, resp['doc_count']);
            });
        },

        get: function() {
            db.get.apply(db, arguments);
        },
        post: function() {
            db.post.apply(db, arguments);
        },
        put: function() {
            db.put.apply(db, arguments);
        },
        remove: function() {
            db.remove.apply(db, arguments);
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
                callback
            )
        },

        query: function(mapFunction, callback) {
            db.query({ map: mapFunction}, callback);
        },

        addCurrency: function(name, options, callback) {
            db.post(
                {
                    type: 'currency',
                    name: name,
                    options: options
                },
                callback
            )
        },

        db: db

    };
});