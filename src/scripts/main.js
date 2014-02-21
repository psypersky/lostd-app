'use strict';

require(['crypto', 'database', 'global', 'react', 'widgets/splash', 'widgets/window'], function(Crypto, Database, Global, React, Splash, Window) {

    var R = React.DOM;

	React.renderComponent(
        React.createClass({
            displayName: 'Main',
            onReady: function() { this.setState({ what: Window(null) }); },
            getInitialState: function() {
                return {  what: R.p(null, 'Loading...') };
            },
            componentWillMount: function() {
                var self = this;
                Database.get('user:settings', function(err, settings) {
                    if (!err) {
                        console.log('Found user settings: ', settings);
                        console.assert(settings['private_key']);
                        console.assert(settings['database_url']);

                        if (window.localStorage && window.localStorage['password']) {
                            Database.setDatabaseUrl(settings['database_url']);
                            Database.replicate();
                            Global.keys = Crypto.decryptKeysFromPrivateKey(window.localStorage['password'], settings['private_key']);
                            self.onReady();
                            return;
                        }
                    }

                    self.setState({ what: Splash({ onReady: self.onReady, settings: settings })});

                });
            },
            render: function() {
                return this.state.what;
            }
        })(null),
		document.body
	);

});
