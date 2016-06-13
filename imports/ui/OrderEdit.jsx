import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ReactDOM from 'react-dom';
import { Orders } from '../api/orders.js';
import { Productions } from '../api/productions.js';
import { Alert, Form, Input, Label, Button, Modal, Select } from './bootstrap/index.jsx';

// App component - represents the whole app
export default class OrderEdit extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    };
  };

  update(name, value) {
    var order = this.props.order;
    order[name] = value;
    var orderId = order._id
    delete order._id;
    Orders.upsert(orderId, { $set: order});
  }

  remove() {
    var orderId = this.props.order._id
    Orders.remove({_id: orderId});
    FlowRouter.go("/orders");
  }

  toggleModal(){
    this.setState({
      showModal: !this.state.showModal,
    });
  }

  addProduction(){

  }

  render() {
    console.log(this.props)
    console.log(this.state)
    return (
      <div className="order-edit">
        <Form>
        <Label>Name</Label>
        <Input
        name="name"
        value={this.props.order.name}
        onChange={this.update.bind(this)} />
        </Form>
        <Button style="primary" onClick={this.toggleModal.bind(this)}>Add Production</Button>

        <ul className="list-group">
          <li draggable="true" className="list-group-item">
            <span className="label label-default label-pill pull-xs-right">14</span>
            Cras justo odio
          </li>
          <li draggable="true" className="list-group-item">
            <span className="label label-default label-pill pull-xs-right">2</span>
            Dapibus ac facilisis in
          </li>
          <li draggable="true" className="list-group-item">
            <span className="label label-default label-pill pull-xs-right">1</span>
            Morbi leo risus
          </li>
        </ul>

        <Modal
        showModal={this.state.showModal}
        title="Add Production"
        onCancel={this.toggleModal.bind(this)}
        cancelLabel="Cancel"
        onConfirm={this.addProduction.bind(this)}
        confirmLabel="Add">
          <Label>Production</Label>
          <Select options={this.props.productions.map((item) => {
            return {key: item._id, value: item.name};
          })}/>
          <Label>duration</Label>
          <Input
          name="duration" type="number" />
        </Modal>

        <Button style="danger" onClick={this.remove.bind(this)}>Delete</Button>
      </div>
    );
  }
}

OrderEdit.propTypes = {
  order: PropTypes.object.isRequired,
};

export default createContainer(({orderId}) => {
  console.log(orderId)
  return {
    order: Orders.find({_id: orderId}).fetch()[0],
    productions: Productions.find({}, { sort: { createdAt: -1 } }).fetch(),
  };
}, OrderEdit);
