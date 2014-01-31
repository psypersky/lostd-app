'use strict';

define(['react', 'settings', 'json_req', 'widgets/input_username'], function(React, Settings, JsonReq, InputUsername) {

	return React.createClass({
		displayName: 'SettingsRegister',

		getInitialState: function() {
			return { error: null, inProgress: false };
		},

		render: function() {
			return (
				React.DOM.form({ onSubmit: this.onRegister },
					React.DOM.h2(null, 'Register!'),
					(this.state.error ? React.DOM.p(null, this.state.error) : null),

					React.DOM.table(null,
						React.DOM.tr(null,
							React.DOM.td(null, 'Username:'),
							React.DOM.td(null, InputUsername({ ref: 'username' }))
						),
						React.DOM.tr(null,
							React.DOM.td(null, 'Password:'),
							React.DOM.td(null, React.DOM.input({ ref: 'password', type: 'password', placeholder: 'password', required: true }))
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
					)
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
			if (email.length < 4) {
				this.setState({ error: 'Email must be at least 4 characters' });
				return false;
			} else if (email.indexOf('@') === -1) {
				this.setState({ error: 'Email is invalid' });
				return false;
			}

			this.setState({ error: null, inProgress: true });

            var federation = Settings.get('federation_server');
            if (!federation)
                federation = 'http://federation.lostd.com';

			var to = federation + '/api/create_user';
			var self = this;

			JsonReq.post(to, { username: username, password: password, email: email }, function(err, response) {

                if (err) {
                    console.error('Got error: ', err);
                    err = err.toString();
                }

                if (self.isMounted())
				    self.setState({ error: err, inProgress: false });

				if (!err) {
					Settings.set('database_url', response.database_url);
				}

			});

			return false;
		}
	});
});