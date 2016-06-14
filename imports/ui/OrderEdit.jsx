import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ReactDOM from 'react-dom';
import { Orders } from '../api/orders.js';
import { Productions } from '../api/productions.js';
import { Alert, Form, Input, Label, Button, Modal, Select, ListGroup } from './bootstrap/index.jsx';
import '../lib/array-prototype-move';
import * as Notification from 'notie';

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
    var order = this.props.order;
    var prodName = ReactDOM.findDOMNode(this.refs.production).value;
    var duration = ReactDOM.findDOMNode(this.refs.duration).value;
    var refId = _.where(this.props.productions, {name: prodName})[0]._id;
    if(_.find(order.productions, (item) => { return item.ref_id == refId })){
      Notification.alert(3, 'Already in list!', 2.5);
    }else{
      order.productions.push({ref_id: refId, name: prodName, duration: duration});
      Orders.update(order._id, { $set: {productions: order.productions}});
    }
    this.toggleModal();
  }

  handleDrop(sourceId, targetId){
    var list = this.props.order.productions;
    var source =  _.find(list, (item) => { return item.ref_id == sourceId })
    var indexSource = list.indexOf(source);
    var target = _.find(list, (item) => { return item.ref_id == targetId })
    var indexTarget = list.indexOf(target);
    list.move(indexSource, indexTarget);
    Orders.update(this.props.order._id, { $set: {productions: list}});
  }

  renderProductionList(productions){
    var items = productions.map((item) => {
      return {key: item.ref_id, label: item.name, labelPill: item.duration}
    });
    return (<ListGroup onDrop={this.handleDrop.bind(this)} draggable="true" items={items} />);
  }

  render() {
    if(!this.props.order){return (<Alert style="warning">Order loading ...</Alert>)}
    return (
      <div className="order-edit">

        <h1>Edit order</h1>
          
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
  return {
    order: Orders.find({_id: orderId}).fetch()[0],
    productions: Productions.find({}, { sort: { createdAt: -1 } }).fetch(),
  };
}, OrderEdit);
