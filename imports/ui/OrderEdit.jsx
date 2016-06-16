import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ReactDOM from 'react-dom';
import { Orders } from '../api/orders.js';
import { Productions } from '../api/productions.js';
import { Alert, Form, FormGroup, Input, Label, Button, Modal, Select, ListGroup, GridRow, GridColumn, PageHeader } from './bootstrap/index.jsx';
import '../lib/array-prototype-move';
import * as Notification from 'notie';

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
      order.productions.push({ref_id: refId, duration: duration});
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

    // get name and prepare for the list
    var items = productions.map((production) => {
        var refProd = _.where(this.props.productions, {_id: production.ref_id})
        var name = "Production deleted."
        if(refProd.length > 0){
          name = refProd[0].name
        }
        return {key: production.ref_id, label: name, labelPill: production.duration}
    });

    return (<ListGroup onDrop={this.handleDrop.bind(this)} draggable="true" items={items} />);
  }

  render() {
    if(!this.props.order){return (<Alert style="warning">Order loading ...</Alert>)}
    return (
      <GridRow className="order-edit"><GridColumn className="col-md-8 col-md-offset-2">
        <PageHeader tag="h1">Order Edit</PageHeader>

        <Form>
          <FormGroup>
            <Label>Name</Label>
            <Input
            name="name"
            defaultValue={this.props.order.name}
            onChange={this.update.bind(this)} />
          </FormGroup>
        </Form>
        <p><Button style="primary" onClick={this.toggleModal.bind(this)}>Add Production</Button></p>

        {this.renderProductionList(this.props.order.productions)}
        <p></p>

        <Modal
        showModal={this.state.showModal}
        title="Add Production"
        onCancel={this.toggleModal.bind(this)}
        cancelLabel="Cancel"
        onConfirm={this.addProduction.bind(this)}
        confirmLabel="Add">
          <Form>
            <FormGroup>
              <Label>Production</Label>
              <Select ref="production" options={this.props.productions.map((item) => {
                return {key: item._id, value: item.name};
              })}/>
            </FormGroup>
            <FormGroup>
              <Label>Duration</Label>
              <Input
              ref="duration" type="number" defaultValue="1" />
            </FormGroup>
          </Form>
        </Modal>

        <p><Button style="danger" onClick={this.remove.bind(this)}>Delete</Button></p>
      </GridColumn></GridRow>
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
