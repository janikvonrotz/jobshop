import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ReactDOM from 'react-dom';
import { Orders } from '../api/orders.js';
import { Productions } from '../api/productions.js';
import { Alert, Form, Input, Label, Button, Modal, Select, ListGroup } from './bootstrap/index.jsx';

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
    console.log(ReactDOM.findDOMNode(this.refs.duration).value, ReactDOM.findDOMNode(this.refs.production).value)
    var order = this.props.order;
    var position = order.productions.length + 1;
    var prodName = ReactDOM.findDOMNode(this.refs.production).value;
    var duration = ReactDOM.findDOMNode(this.refs.duration).value;
    var refId = _.where(this.props.productions, {name: prodName})[0]._id;
    order.productions.push({ref_id: refId, name: prodName, duration: duration, position: position});
    Orders.update(order._id, { $set: {productions: order.productions}});
    this.toggleModal();
  }

  renderProductionList(productions){
    var items = productions.map((item) => {
      return {key: item.ref_id, label: item.name, labelPill: item.duration, position: item.position}
    });
    return (<ListGroup draggable="true" items={items} />);
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
        defaultValue={this.props.order.name}
        onChange={this.update.bind(this)} />
        </Form>
        <Button style="primary" onClick={this.toggleModal.bind(this)}>Add Production</Button>

        {this.renderProductionList(this.props.order.productions)}

        <Modal
        showModal={this.state.showModal}
        title="Add Production"
        onCancel={this.toggleModal.bind(this)}
        cancelLabel="Cancel"
        onConfirm={this.addProduction.bind(this)}
        confirmLabel="Add">
          <Label>Production</Label>
          <Select ref="production" options={this.props.productions.map((item) => {
            return {key: item._id, value: item.name};
          })}/>
          <Label>duration</Label>
          <Input
          ref="duration" type="number" defaultValue="0" />
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
