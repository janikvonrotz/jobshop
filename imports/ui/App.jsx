import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ReactDOM from 'react-dom';
import { Alert } from 'bitsherpa-rope';
import { Orders } from '../api/orders.js';

export default class App extends Component {

  render() {
    return (
      <div>

        <h1>Dashboard</h1>


      </div>
    );
  }
}

App.propTypes = {
  orders: PropTypes.array.isRequired,
};

export default createContainer(() => {
  return {
    orders: Orders.find({}, { sort: { createdAt: -1 } }).fetch(),
  };
}, App);
