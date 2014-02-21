'use strict';

define(['react','pouchdb-nightly',
    'database',
    'widgets/contact_list', 'widgets/contact_adder', 'widgets/contact_detail',
    'widgets/record_adder', 'widgets/record_list', 'widgets/settings',
    'widgets/logout'
],
    function(React, PouchDB
        , Database
        , ContactList, ContactAdder, ContactDetail
        , RecordAdder, RecordList, Settings
        , Logout
    ) {

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
            var btn = R.section({className: 'right-small tab-bar-button'}, R.p(null, 'TODO:'));
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

        showContactAdder: function() {
            this.setState({ widget: ContactAdder(), topRightButton: this.contactCancelButton() });
        },

        contactAddButton: function() {
            return this.createButton('fi-plus', this.showContactAdder);
        },

        //Return a function to be attached on the button
        contactCancelButton: function() {
            return this.createButton('fi-x', this.showContactList);
        },

        showRecords: function() {
            this.setState({ widget: RecordList(null), topRightButton: this.recordAddButton() });
        },

        showRecordAdder: function() {
            this.setState({ widget: RecordAdder(null), topRightButton: this.recordCancelButton() });
        },

        recordAddButton: function() {
            return this.createButton('fi-plus', this.showRecordAdder);
        },

        recordCancelButton: function() {
            return this.createButton('fi-x', this.showRecords);
        },

        showPayments: function() {
            var btn = R.section({className: 'right-small tab-bar-button'}, R.p(null, 'TODO:'));
            var widget =  R.p(null, 'Payments... (TODO:...)');
            this.setState({widget: widget, topRightButton: btn });
        },

        changeWindowWidget: function(widget) {
            var self = this;
            self.setState({widget: widget});
        },

        setTopButton: function(button) {
            var self = this;
            this.setState({topRightButton: button})
        },

        showSettings: function() {
            var widget = Settings({changeWindowWidget: this.changeWindowWidget, setTopButton: this.setTopButton});
            this.setState({widget: widget});
        },

        logoutCancelButton: function() {
            return this.createButton('fi-x', this.showContactList); // Perhaps, more appropriately should revert state..
        },

        showLogout: function() {
            this.setState({widget: Logout(null), topRightButton: this.logoutCancelButton() });
        },

        // Return a button of type 'className' 
        // if clicked set this.widget to onClickWidget and this.topRightButton to onClickButton
        createButton: function(className, show) {
            var self = this;

            return R.section({
                className: 'right-small tab-bar-button',
                onClick: show
            }, R.a({ href: '#', className: 'tab-bar-icon' }, React.DOM.i({className: className + ' size-21 menu-icon-style'}))
            );
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
                        self.state.topRightButton
                    ),
                    R.div({className: offCanvasWrap },
                        R.div({className: 'inner-wrap'},
                                R.aside({className: 'left-off-canvas-menu'},
                                    R.ul({className: 'off-canvas-list'},
                                        R.li({ onClick: self.showOverview }, R.a({href: '#'}, 'Overview')),
                                        R.li({ onClick: self.showContactList }, R.a({href: '#'}, 'Contacts')),
                                        R.li({ onClick: self.showRecords }, R.a({href: '#'}, 'Records')),
                                        R.li({ onClick: self.showPayments }, R.a({href: '#'}, 'Payments')),
                                        R.li({ onClick: self.showSettings }, R.a({href: '#'}, 'Settings')),
                                        R.li({ onClick: self.showLogout }, R.a({href: '#'}, 'Logout'))
                                    )
                                ),
                                R.section({className: 'main-section'},
                                    this.state.widget
                                )
                            //R.a({className:'exit-off-canvas'}, null)   //TODO: Apply the exit off canvas
                        )
                    )
                )//main-wrapper
            );
        }//render
    });
});