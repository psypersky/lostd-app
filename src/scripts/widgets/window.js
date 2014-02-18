'use strict';

define(['react','pouchdb-nightly',
    'database', 'settings',
    'widgets/contact_list', 'widgets/contact_adder', 'widgets/contact_detail',
    'widgets/record_adder', 'widgets/record_list'
],
    function(React, PouchDB
        , Database, Settings
        , ContactList, ContactAdder, ContactDetail
        , RecordAdder, RecordList) {

    var R = React.DOM;

    return React.createClass({
        displayName: 'Window',

        getInitialState: function() {
            return {
                widget: this.contactListWidget(),
                moveRight: false,
                topRightButton: this.contactAddButton()
            };
        },

        showOverview: function() {
            var btn = R.p(null, 'TODO:');
            var widget = R.p(null, 'Overview... (TODO:...)');
            this.setState({widget: widget, topRightButton: btn });
        },

        showContactList: function() {
            this.setState({ widget: this.contactListWidget(), topRightButton: this.contactAddButton() })
        },

        showContactDetail: function(contact) {
            this.setState({ widget: this.detailListWidget(contact), topRightButton: this.contactCancelButton() })
        },

        contactListWidget: function() {
            var self = this;
            return ContactList({
                onContactClicked: self.showContactDetail
            });
        },

        contactAddButton: function() {
            return this.createButton('fi-plus', ContactAdder, this.contactCancelButton);
        },

        //Return a function to be attached on the button
        contactCancelButton: function() {
            return this.createButton('fi-x', this.contactListWidget, this.contactAddButton);
        },

        showRecords: function() {
            this.setState({ widget: RecordList(null), topRightButton: this.recordAddButton() });
        },

        recordAddButton: function() {
            return this.createButton('fi-plus', RecordAdder, this.recordCancelButton);
        },

        recordCancelButton: function() {
            return this.createButton('fi-x', RecordList, this.recordAddButton);
        },

        showPayments: function() {
            var btn = R.p(null, 'TODO:');
            var widget = R.p(null, 'Payments... (TODO:...)');
            this.setState({widget: widget, topRightButton: btn });
        },

        showSettings: function() {
            var btn = R.p(null, 'TODO:');
            var widget = R.p(null, 'Settings... (TODO:...)');
            this.setState({widget: widget, topRightButton: btn });
        },

        // Return a button of type 'className' 
        // if clicked set this.widget to onClickWidget and this.topRightButton to onClickButton
        createButton: function(className, onClickWidget, onClickButton) {
            var self = this;
            return R.a({
                    href: '#',
                    onClick: function() {
                        console.log('Add button clicked');
                        self.setState({ widget: onClickWidget(), topRightButton: onClickButton() });
                    }
                },
                React.DOM.i({className: className + ' size-21 menu-icon-style'}));
        },

        detailListWidget: function(contact) {
            var self = this;
            return ContactDetail({
                contact: contact,
                onDelete: self.showContactList
            });
        },

        toggleOfCanvasMenu: function(e) {
            this.setState({ moveRight: !this.state.moveRight });
        },

        render: function() {
            var self = this;

            var offCanvasWrap = 'off-canvas-wrap';
            if (this.state.moveRight)
                offCanvasWrap += ' move-right';

            return (
                R.div({className: 'main-wrapper'},
                    R.nav({className: 'tab-bar' },
                        R.section({className: 'left-small'},
                            R.a({className: 'menu-icon', onClick: this.toggleOfCanvasMenu},
                                R.span(null)
                            )
                        ),
                        R.section({className: 'right tab-bar-section'},
                            R.h1({className: 'title'}, 'Lostd App')
                        ),
                        R.section({className: 'right-small text-center'},
                            self.state.topRightButton
                        )
                    ),
                    R.div({className: offCanvasWrap },
                        R.div({className: 'inner-wrap'},
                            R.aside({className: 'left-off-canvas-menu'},
                                R.ul({className: 'off-canvas-list'},
                                    R.li({ onClick: self.showOverview }, R.a({href: '#'}, 'Overview')),
                                    R.li({ onClick: self.showContactList }, R.a({href: '#'}, 'Contacts')),
                                    R.li({ onClick: self.showRecords }, R.a({href: '#'}, 'Records')),
                                    R.li({ onClick: self.showPayments }, R.a({href: '#'}, 'Payments')),
                                    R.li({ onClick: self.showSettings }, R.a({href: '#'}, 'Settings'))
                                )
                            ),
                            R.section({className: 'main-section'},
                                R.div({className: 'row'},
                                    R.div({className: 'large-12 columns'},
                                        this.state.widget
                                    )
                                )
                            )
                        )
                    )
                )//main-wrapper
            );
        }//render
    });
});