'use strict';

define(['database', 'react', 'settings', 'json_req', 'widgets/input_username'], function(Database, React, Settings, JsonReq, InputUsername) {

	return React.createClass({
		displayName: 'SettingsRegister',

		getInitialState: function() {
			return { error: null, inProgress: false, done: false };
		},

		render: function() {

            if (this.state.done)
                return React.DOM.p(null, 'Account created, and logged in! Enjoy!');

			return (
				React.DOM.form({ onSubmit: this.onRegister },
					React.DOM.h2(null, 'Register!'),
					(this.state.error ? React.DOM.p({ className: 'errorText' }, this.state.error) : null),
					React.DOM.table(null,
						React.DOM.tr(null,
							React.DOM.td(null, 'Username:'),
							React.DOM.td(null, InputUsername({ ref: 'username' }))
						),
						React.DOM.tr(null,
							React.DOM.td(null, 'Password:'),
							React.DOM.td(null, React.DOM.input({ ref: 'password', type: 'password', placeholder: 'password', required: true, pattern: '.{4,}', title: 'Password must have AT LEAST 4 characters (but seriously, should be much more)' }))
						),
						React.DOM.tr(null,
							React.DOM.td(null, 'Confirm Password:'),
							React.DOM.td(null, React.DOM.input({ ref: 'confirm', type: 'password', placeholder: 'password', required: true }))
						),
						React.DOM.tr(null,
							React.DOM.td(null, 'Email:'),
							React.DOM.td(null, React.DOM.input({ ref: 'email', type: 'email', placeholder: 'email', required: true }))
						),
						React.DOM.tr(null,
								React.DOM.td(null, ''),
							React.DOM.td(null, React.DOM.input({ disabled: this.state.inProgress, type: 'submit', value: 'Register!' }))
						)
					),
                    (this.state.inProgress ? React.DOM.p(null, 'Status: ', this.state.inProgress) : null)
				)
			)
		},


		onRegister: function() {
			var username = this.refs.username.getDOMNode().value.trim();

			var password = this.refs.password.getDOMNode().value;
			var confirm = this.refs.confirm.getDOMNode().value;

			if (password.length === 0) {
				this.setState({ error: 'Please enter a password' });
				return false;
			}

			if (password !== confirm) {
				this.setState({ error: 'Password and confirm password do not match' });
				return false;
			}

			var email = this.refs.email.getDOMNode().value.trim();

			this.setState({ error: null, inProgress: 'Asking federation to provision a new account and database...' });

            var federation = Settings.get('federation_server');
            if (!federation)
                federation = 'http://federation.lostd.com';

			var to = federation + '/api/create_user';
			var self = this;

			JsonReq.post(to, { username: username, password: password, email: email }, function(err, response) {

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