import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import React from 'react';

const App = (props) => (
  <div>
    <section id="menu">
      <a href="/">Dashboard</a>
      <a href="/orders">Orders</a>
      <a href="/productions">Productions</a>
    </section>
    <div className="container">{props.main}</div>
  </div>
);

export default AppContainer = createContainer(props => {
  // props here will have `main`, passed from the router
  // anything we return from this function will be *added* to it
  return {
    // user: Meteor.user(),
  };
}, App);
