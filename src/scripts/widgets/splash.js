'use strict';

define(['assert', 'crypto', 'database', 'global', 'json_req', 'react', 'widgets/input_username'], function(assert, Crypto, Database, Global, JsonReq, React, InputUsername) {

    return React.createClass({
        displayName: 'Splash',

        propTypes: {
            settings: React.PropTypes.object,
            onReady: React.PropTypes.func.isRequired
        },

        getInitialState: function() {
            var choice = this.props.settings ? 'login' : 'sign_up';
            return { choice: choice, inProgress: false, err: null };
        },

        getServer: function() {
            return this.refs['federationServer'].getDOMNode().value.trim();
        },

        setProgress: function(msg) {
            this.setState({ error: null, inProgress: msg });
        },

        // Does error handling. If no error, callback called with database url
        send: function(to, fields, callback) {
            var self = this;
            self.setProgress('Sending request to lostd federation!');
            JsonReq.post(this.getServer() + to, fields, function(err, response) {
                console.assert(self.isMounted());
                if (err) {
                    console.error('Got error: ', err);
                    self.setState({ error: 'Error: ' + err, inProgress: false });
                    return;
                }

                var databaseUrl = response['database_url'];

                if (!databaseUrl) {
                    self.setState({ error: 'Server responded without a database url', inProgress: false });
                    return;
                }

                callback(databaseUrl);
            });
        },

        syncAndReady: function(password, databaseUrl) {
            var self = this;
            self.setProgress('Synchronizing offline copy of data, please be patient');

            var hashPass = Crypto.hash(password);

            window.localStorage['password'] = hashPass; // TODO: only if there's an option set to save..
            Database.setDatabaseUrl(databaseUrl);
            Database.sync(function(err) {
                if (err) {
                    console.error('Error during sync: ', err);

                    console.assert(self.isMounted());
                    self.setState({ error: 'Unable to sync data', inProgress: false });
                    return;
                }

                console.log('Finished syncing...');

                self.setProgress('Loading encryption keys');
                Database.get('user:settings', function(err, settings) {
                    console.assert(!err);
                    console.assert(settings['private_key']);
                    console.assert(settings['database_url']);

                    Database.setDatabaseUrl(settings['database_url']);
                    Database.replicate();
                    Global.keys = Crypto.decryptKeysFromPrivateKey(hashPass, settings['private_key']);

                    // TODO: check if need to update settings [In terms of federation, and database url]

                    console.log('Great success! Finished loading encryption keys!');
                    self.props.onReady();
                });

            });

        },

        onLogin: function() {
            var self = this;
            var username = this.refs.username.getDOMNode().value.trim();
            var password = this.refs.password.getDOMNode().value;
            var passwordHash = Crypto.passwordHash(username, password);

            this.send('/api/login', { username: username, password: passwordHash }, function(databaseUrl) {


                if (self.props.settings) {
                   if (typeof self.props.settings['username'] !== 'string' ||
                       self.props.settings['username'].toLowerCase() !== username.toLowerCase() ||
                       typeof self.props.settings['federation_server'] !== 'string' ||
                       self.props.settings['federation_server'].toLowerCase() !== self.getServer().toLowerCase()) { // bad approximation

                       Database.destroy(function(err) {
                           console.assert(!err);
                           console.log('Starting from fresh database..');
                           self.syncAndReady(password, databaseUrl);
                           return;
                       });
                   }
                }

                self.syncAndReady(password, databaseUrl);
            });

            return false;
        },

        onRegister: function() {
            var self = this;
            var username = this.refs.username.getDOMNode().value.trim();
            var password = this.refs.password.getDOMNode().value;
            var confirm = this.refs.confirm.getDOMNode().value;
            var email = this.refs.email.getDOMNode().value.trim();

            if (password !== confirm) {
                this.setState({ error: 'Password and confirm password do not match' });
                return false;
            }

            var passwordHash = Crypto.passwordHash(username, password);

            var fields = { username: username, password: passwordHash, email: email };

            this.send('/api/create_user', fields, function(databaseUrl) {

                Database.destroy(function(err) {
                    console.assert(!err);
                    console.log('Starting from fresh database');

                    var keys = Crypto.generateKeys();
                    var publicKey = Crypto.formatPublicKey(keys.pub);
                    var encryptedPrivateKey = Crypto.encryptPrivateKey(Crypto.hash(password), keys.sec);

                    Database.put({
                        _id: 'user:settings',
                        type: 'settings',
                        database_url: databaseUrl,
                        public_key: publicKey,
                        private_key: encryptedPrivateKey,
                        federation_server: self.getServer(),
                        username: username
                    }, function(err) {
                        if (err) {
                            console.error('Account created on server, but we couldn\'t save details to local database because of ', err, 'so we are a bit screwed' +
                                ' if it helps, (encrypted) private key is: ', encryptedPrivateKey);
                            self.setState({ error: 'Unable to create record to local db (after creating remote account) ' + err, inProgress: false });
                            return;
                        }

                        self.syncAndReady(password, databaseUrl);
                    });
                });


            });

            return false;
        },

        render: function() {
            var self = this;
            var R = React.DOM;

            var headerText;
            var paragraph;
            var fields;
            var submitFn;

            if (this.state.choice === 'login') {
                headerText = 'Login';
                paragraph = React.DOM.p(null, 'Login to your lostd account to get all your data! If you don\'t have an account you can ',
                    React.DOM.input({ type: 'button', value: 'Sign Up!', onClick: function() { self.setState({ choice: 'sign_up' }) }})
                );

                var defaultUser = (this.props.settings && this.props.settings['username']) ? this.props.settings['username'] : '';

                fields = {
                    'Username': InputUsername({ ref: 'username', defaultValue: defaultUser }),
                    'Password': React.DOM.input({ ref: 'password', type: 'password', placeholder: 'password', pattern: '.{4,}', required: true, title: 'Password must have at least 4 characters' })
                };
                submitFn = this.onLogin;

            } else {
                assert(this.state.choice == 'sign_up');
                headerText = 'Sign Up';
                paragraph = React.DOM.p(null, 'Create an account to get started. We will keep a backup your data and give you a public address. Or if you already have an account ',
                    React.DOM.input({ type: 'button', value: 'Login!', onClick: function() { self.setState({ choice: 'login' }) }}));

                fields = {
                    'Username': InputUsername({ ref: 'username' }),
                    'Password': React.DOM.input({ ref: 'password', type: 'password', placeholder: 'password', pattern: '.{4,}', required: true, title: 'Password must have at least 4 characters' }),
                    'Confirm Password': React.DOM.input({ ref: 'confirm', type: 'password', placeholder: 'password', pattern: '.{4,}', required: true, title: 'Password must have at least 4 characters' }),
                    'Email': React.DOM.input({ ref: 'email', type: 'email', placeholder: 'you@email.com', pattern: '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$', required: true })
                };

                submitFn = this.onRegister;
            };

            var err = this.state.error ? React.DOM.p({ className: 'errorText' }, this.state.error) : null;

            var rows = Object.keys(fields).map(function(name) {
                return R.tr({ key: 'row_' + name},
                    R.td(null, name, ':'),
                    R.td(null, fields[name]));
            });


            var submitButton = this.state.inProgress ? R.input({ type: 'submit', value: this.state.inProgress, disabled: true}) : R.input({ type: 'submit', value: headerText});

            var defaultFederation = (this.props.settings && this.props.settings['federation_server']) ? this.props.settings['federation_server'] : 'http://federation.lostd.com';


            return React.DOM.div(null,
                React.DOM.h1(null, 'Welcome to Lostd!'),
                err,
                React.DOM.form({ onSubmit: submitFn },
                    React.DOM.fieldset(null,
                        React.DOM.legend(null, headerText),
                        paragraph,

                        R.table(null,
                            R.tbody(null,
                                rows,
                                R.tr(null,
                                    R.td(null, ''),
                                    R.td(null, submitButton)
                                )
                            )
                        )
                    ),
                    React.DOM.fieldset(null,
                        React.DOM.legend(null, 'Advanced'),
                        'Federation Server: ', React.DOM.input({ ref: 'federationServer', type: 'text', defaultValue: defaultFederation })
                    )

            ));
        }

    });

});
