import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ReactDOM from 'react-dom';
import { Orders } from '../api/orders.js';
import { Alert } from 'bitsherpa-rope';

// App component - represents the whole app
export default class App extends Component {

  handleSubmit(event) {
    event.preventDefault();
    // Find the text field via the React ref
    const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();
    Orders.insert({
      name: text,
      createdAt: new Date(), // current time
    });
    // Clear form
    ReactDOM.findDOMNode(this.refs.textInput).value = '';
  }

  renderOrders() {
    return this.props.orders.map((order) => (
      <li key={order._id}>{order.name}</li>
    ));
  }

  render() {
    return (

      <div>

        <h1>Order</h1>

        <form className="new-order" onSubmit={this.handleSubmit.bind(this)} >
          <input
            type="text"
            ref="textInput"
            placeholder="Type to add new tasks"
          />
        </form>

        <ul>
          {this.renderOrders()}
        </ul>

      </div>
    );
  }
}

App.propTypes = {
  orders: PropTypes.array.isRequired,
};

export default createContainer(() => {
  return {
    orders: Orders.find({}, { sort: { createdAt: -1 } }).fetch()
  };
}, App);
