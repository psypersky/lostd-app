'use strict';

define(['react'], function(React) {

    return React.createClass({
        displayName: 'InputUsername',

        render: function() {
            var bannedCharacters = '\\s&\\$\\+\\,/\\:;\\=\\?@<>\\[\\]\\{\\}\\|\\\\\\^~%#';

            return React.DOM.input({ type: 'text', placeholder: 'username',
                pattern: '[^' + bannedCharacters + ']{4,40}', required: true, title: 'Username must be between 4 and 40 characters, ' +
                    'not contain spaces or any special characters' });
        }

    });

});
