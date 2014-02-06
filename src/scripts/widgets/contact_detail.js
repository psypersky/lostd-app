'use strict';

define(['react', 'database'], function(React, Database) {

    return React.createClass({
        displayName: 'ContactDetail',

        propTypes: {
            contact: React.PropTypes.object.isRequired
        },

        getInitialState: function() {
    		return { editing: null };
  		},

        handleUpdate: function(what) {
        	var self = this;
 
			return function() {
				self.props.contact[what] = self.refs[what].getDOMNode().value.trim();
				Database.updateContact(self.props.contact, function (err, response) {
					if (err) return console.error('Caught error updating contact: ', err);

					if (self.isMounted())
						self.setState({ editing: null });
					self.props.contact._rev = response.rev;
				});
				return false;
			}
        },

		handleClicks: function(e) {
			var className = e.target.className;

			switch(className){
				case 'description':
					this.setState({ editing: 'description' });
					break;
				case 'name':
					this.setState({ editing: 'name' });
					break;
				default:
					this.setState({ editing: null });
			}

		},

		render: function() {
			//Name field
			var name;
			if(this.state.editing === 'name') {
				name = React.DOM.form({ id: 'name', onSubmit: this.handleUpdate('name')},
					React.DOM.input({ type: 'text', placeholder: 'Name', ref: 'name', className: 'name', defaultValue: this.props.contact.name}),
					React.DOM.input({ type: 'submit', value: 'Save!', className: 'name' })
				);
			} else {
				name = React.DOM.div(null, 
					React.DOM.h3({	ref: 'name', className: 'name'}, this.props.contact.name)
				);
			}
		    
			//Description Field
			var description;
			if(this.state.editing === 'description') {
				description = React.DOM.form({ id: 'description', onSubmit: this.handleUpdate('description')},
					React.DOM.h3(null, 'Description'),
					React.DOM.textarea({ autoFocus: true, placeholder: 'Description', ref: 'description', className: 'description', defaultValue: this.props.contact.description}),
					React.DOM.input({ type: 'submit', value: 'Save!', className: 'description' })
				);
			} else {
				description = React.DOM.div(null, 
					React.DOM.h3(null, 'Description: '),
					React.DOM.p({ ref: 'description', className: 'description'}, this.props.contact.description)
				);
			}

			return React.DOM.div({className: 'contact_details', onClick: this.handleClicks},
				name,
				React.DOM.br(null),
				description,
				React.DOM.br(null)
			);
		}
    });
});
 