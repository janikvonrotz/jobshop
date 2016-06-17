import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ReactDOM from 'react-dom';
import { Orders } from '../api/orders.js';
import { Alert, Button, GridRow, GridColumn, PageHeader, ListGroup } from './bootstrap/index.jsx';

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
    var items = this.props.orders.map((item) => {
      return {key: item._id, label: item.name, href: "/orders/" + item._id };
    });
    return (<ListGroup linked="true" items={items} />);
  }

  render() {
    return (
      <GridRow className="order-list"><GridColumn className="col-md-8 col-md-offset-2">
        <PageHeader tag="h1">Orders</PageHeader>
        <p><Button style="primary" onClick={this.insert.bind(this)}>New Order</Button></p>
        {this.renderOrders()}
      </GridColumn></GridRow>
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
