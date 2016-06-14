import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ReactDOM from 'react-dom';
import { Orders } from '../api/orders.js';
import { Alert, Button } from './bootstrap/index.jsx';

// App component - represents the whole app
export default class OrderList extends Component {

  insert(event){
    var id = Orders.insert({
      name: "name",
      createdAt: new Date(),
      productions: [],
    });
    FlowRouter.go("/orders/" + id)
  }

  renderOrders() {
    return this.props.orders.map((order) => (
      <li key={order._id}><a href={"/orders/" + order._id}>{order.name}</a></li>
    ));
  }

  render() {
    return (

      <div>

        <h1>Orders</h1>

        <Button style="primary" onClick={this.insert.bind(this)}>New Order</Button>

        <ul>
          {this.renderOrders()}
        </ul>

      </div>
    );
  }
}

OrderList.propTypes = {
  orders: PropTypes.array.isRequired,
};

export default createContainer(() => {
  return {
    orders: Orders.find({}, { sort: { createdAt: -1 } }).fetch(),
  };
}, OrderList);
