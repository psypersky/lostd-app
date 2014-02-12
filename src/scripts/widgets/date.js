'use strict';

define(['react'], function(React) {

    return React.createClass({
        displayName: 'DateWidget',

        propTypes:{
            date: React.PropTypes.number
        },

        render: function() {

        var date = new Date(this.props.date)
        var dateStr = date.getDay() + '/' + date.getMonth() + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
            
            return React.DOM.span(null, dateStr);
        }

    });

});
