'use strict';

define(['react', 'database', 'json_req'], function(React, Database, JsonReq) {

    return React.createClass({
        displayName: 'ContactAdder',

        getInitialState: function() {
            return { done: false, isSubmitting: false, error: null };
        },

        handleAdd: function() {
            var self = this;
            var name = self.refs['contactName'].getDOMNode().value.trim();
            if (!name) {
                this.setState({ error: 'No name for contact!' });
                return false;
            }

            var description = self.refs['description'].getDOMNode().value.trim();

            var lostdAddress = self.refs['lostdAddress'].getDOMNode().value.trim();
            if (lostdAddress.length === 0)
                lostdAddress = null;

            var publicKey = self.refs['publicKey'].getDOMNode().value.trim();
            if (publicKey.length === 0)
                publicKey = null;


            this.setState({ error: null, isSubmitting: true });

            Database.addContact(name, description, lostdAddress, publicKey,  function (err, response) {
                if (!self.isMounted()) return;

                if (err) {
                    self.setState({ isSubmitting: false, error: 'Encounted error: ' + err.toString()});
                } else {
                    console.log('Added new contact: ', name, ' with response ', response);
                    self.setState({ isSubmitting: false, done: true });
                }
            });

            return false;
        },

        lookupLostdAddress: function() {
            var self = this;


            var la = this.refs['lostdAddress'].getDOMNode().value.trim();
            self.refs['publicKey'].getDOMNode().value = '';

            var split = la.split('@');
            if (split.length !== 2 || split[0].length === 0 || split[1].length === 0) {
                self.setState({ error: 'Invalid lostd address. Example format: eric@lostd.com' });
                return;
            }

            var username = split[0];
            var to = 'http://federation.' + encodeURIComponent(split[1]) + '/user/' + encodeURIComponent(username);


            self.setState({ error: null });
            JsonReq.get(to, function(err, res) {
                if (err) {
                    console.error('Error making request to ', to, ' got ', err);
                    if (self.isMounted())
                        self.setState({ error: 'Unable to lookup address, got: ' + err});
                    return;
                }

                var pk = res['public_key'];
                if (!pk || typeof pk !== 'string' || pk.length === 0) {
                    console.error('No public key found: ', pk);
                    if (self.isMounted()) self.setState({ error: 'Unable to get public key from lookup result'});
                    return;
                }

                self.refs['publicKey'].getDOMNode().value = pk;
            });

        },

        render: function() {
            if (this.state.done)
                return React.DOM.p(null, 'Contact Added!');

            return (
                React.DOM.form({ id: 'adder', onSubmit: this.handleAdd },
                    React.DOM.h2(null, 'Add Contact'),
                    (this.state.error ? React.DOM.p({ className: 'errorText' }, this.state.error) : null),
                    'Name: ', React.DOM.input({ type: 'text', placeholder: 'Name', ref: 'contactName', required: true }),
                    React.DOM.br(null),
                    React.DOM.div({ className: 'greybox' },
                        React.DOM.h3(null, 'Optional'),
                        'Description: ', React.DOM.textarea({ placeholder: 'Description...', ref: 'description' }),
                        React.DOM.br(null),
                        'Lostd Address: ', React.DOM.input({ type: 'email', ref: 'lostdAddress', placeholder: 'Lostd Address' }),
                            React.DOM.input({ type: 'button', value: 'lookup!', onClick: this.lookupLostdAddress }),
                        React.DOM.br(null),
                        'Public Key: ', React.DOM.input({ type: 'text', placeholder: 'Public Key', ref: 'publicKey', pattern: "^[a-zA-Z0-9\-_]+$" })

                    ),
                    React.DOM.input({ type: 'submit', value: 'Add contact!', ref: 'submitButton' })
                )
            );
        }
    });
});