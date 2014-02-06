'use strict';

define(['crypto', 'database', 'react', 'settings', 'json_req', 'widgets/input_username'], function(Crypto, Database, React, Settings, JsonReq, InputUsername) {

    return React.createClass({
        displayName: 'SettingsLogin',


        getInitialState: function() {
            return { error: null, inProgress: false, done: false };
        },

        render: function() {

            if (this.state.done)
                return React.DOM.p(null, 'Successfully Logged In!');

            var err = this.state.error ? React.DOM.p({ className: 'errorText' }, this.state.error) : null;

            return React.DOM.form({ onSubmit: this.onLogin },
                React.DOM.h2(null, 'Login!'),
                    err,
                    React.DOM.table(null,
                        React.DOM.tr(null,
                            React.DOM.td(null,
                                'Username: '
                            ),
                            React.DOM.td(null, InputUsername({ ref: 'username' }))
                        ),
                        React.DOM.tr(null,
                            React.DOM.td(null,
                                'Password: '
                            ),
                            React.DOM.td(null,
                                React.DOM.input({ ref: 'password', type: 'password', placeholder: 'password', pattern: '.{4,}', required: true, title: 'Password must have at least 4 characters' })
                            )
                        ),
                        React.DOM.tr(null,
                            React.DOM.td(null,
                                ''
                            ),
                            React.DOM.td(null,
                                React.DOM.input({ disabled: this.state.inProgress, type: 'submit', value: 'Login!' })
                            )
                        )
                    ),
                    (this.state.inProgress ? React.DOM.p(null, 'Status: ', this.state.inProgress) : null)
            );
        },

        onLogin: function() {
            var username = this.refs.username.getDOMNode().value.trim();
            var password = this.refs.password.getDOMNode().value;

            var passwordHash = Crypto.passwordHash(username, password);

            this.setState({ error: null, inProgress: 'Logging into lostd federation!' });

            var federation = Settings.get('federation_server');
            if (!federation)
                federation = 'http://federation.lostd.com';

            var to = federation + '/api/login';
            var self = this;
            JsonReq.post(to, { username: username, password: passwordHash }, function(err, response) {

                if (err) {
                    console.error('Got error: ', err);
                    err = err.toString();
                    if (self.isMounted())
                        self.setState({ error: 'Error: ' + err, inProgress: false });
                    return;
                }

                console.log('Great success!! Got response from federation: ', response);

                Database.cancel(); // Perhaps being a little too defensive..

                var databaseURL = response['database_url'];

                if (self.isMounted())
                    self.setState({ inProgress: 'Synchronizing offline copy of data' });

                Database.sync(databaseURL, function(err) {
                    if (err) {
                        console.error('Error during sync: ', err);
                        if (self.isMounted())
                            self.setState({ error: 'Unable to sync data', inProgress: false });
                        return;
                    }
                    // All ok!

                    Settings.set('database_url', databaseURL);

                    if (self.isMounted())
                        self.setState({ inProgress: false, done: true });
                });


            });

            return false;
        }

    });


});