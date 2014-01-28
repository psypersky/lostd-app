'use strict';

define(['database', 'react', 'settings', 'json_req'], function(Database, React, Settings, JsonReq) {

    return React.createClass({
        displayName: 'SettingsLogin',


        getInitialState: function() {
            return { error: null, inProgress: false, done: false };
        },

        render: function() {

            if (this.state.done)
                return React.DOM.p(null, 'Successfully Logged In!');

            var err = this.state.error ? React.DOM.p(null, this.state.error) : null;

            return React.DOM.form({ onSubmit: this.onLogin },
                React.DOM.h2(null, 'Login!'),
                    err,
                    React.DOM.table(null,
                        React.DOM.tr(null,
                            React.DOM.td(null,
                                'Username: '
                            ),
                            React.DOM.td(null,
                                React.DOM.input({ ref: 'username', type: 'text', placeholder: 'username' })
                            )
                        ),
                        React.DOM.tr(null,
                            React.DOM.td(null,
                                'Password: '
                            ),
                            React.DOM.td(null,
                                React.DOM.input({ ref: 'password', type: 'password', placeholder: 'password' })
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
                    )
            );
        },

        onLogin: function() {
            var username = this.refs.username.getDOMNode().value.trim();

            if (username.length === 0) {
                this.setState({ error: 'Please enter a username' });
                return false;
            } else if (username.length < 4) {
                this.setState({ error: 'Username is too short. Please use at least 4 characters' });
                return false;
            } else if (username.indexOf('@') !== -1) {
                this.setState({ error: 'The @ symbol is invalid in a username'});
                return false;
            }

            var password = this.refs.password.getDOMNode().value;

            if (password.length === 0) {
                this.setState({ error: 'Please enter a password' });
                return false;
            }

            this.setState({ error: null, inProgress: true });

            var to = Settings.getFederationServer() + '/api/login';

            var self = this;

            JsonReq.post(to, { username: username, password: password }, function(err, response) {

                if (err) {
                    console.error('Got error: ', err);
                    err = err.toString();
                }

                if (!err) {
                    console.log('Great success!! Logged in!');
                    var databaseURL = response['database_url'];

                    if (!databaseURL || databaseURL !== Settings.getDatabaseURL()) {
                        Settings.setDatabaseURL(databaseURL);
                        Database.restartReplication();
                        Settings.setLastExport(undefined);
                        Settings.setLastImport(undefined);
                    }
                }

                if (self.isMounted()) {
                    if (err)
                        self.setState({ error: 'Error: ' + err, inProgress: false });
                    else
                        self.setState({ inProgress: false, done: true});
                }

            });

            return false;
        }

    });


});