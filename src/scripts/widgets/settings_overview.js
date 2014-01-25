'use strict';

define(['react'], function(React) {

    return React.createClass({
        displayName: 'SettingsOverview',

        propTypes: {
            sync: React.PropTypes.func.isRequired
        },

        render: function() {
            return React.DOM.input({ type: 'button', value: 'Sync!', onClick: this.props.sync });
        }
    });

});