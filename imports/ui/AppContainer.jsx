import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import React from 'react';
import 'notie/dist/notie.css';
import { Navbar, NavbarNav, GridColumn, GridRow } from './bootstrap/index.jsx';

const App = (props) => (
  <div className="app-root container">
    <Navbar id="app-header" brandLink="/" brand="Flowshop">
      <NavbarNav items={ props.items.left } />
    </Navbar>
    {props.main}
  </div>
);

export default AppContainer = createContainer(props => {
  return {
    items: {
      left: [
        { uid: 'index', href: '/', label: 'Dashboard' },
        { uid: 'order.list', href: '/orders', label: 'Orders' },
        { uid: 'production.list', href: '/productions', label: 'Productions' }
      ]
    }
  };
}, App);
