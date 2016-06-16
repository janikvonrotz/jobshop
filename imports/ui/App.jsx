import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ReactDOM from 'react-dom';
import { Orders } from '../api/orders.js';
import { Productions } from '../api/productions.js';
import { Alert, Form, FormGroup, Input, Label, Button } from './bootstrap/index.jsx';
import * as Notification from 'notie';

export default class App extends Component {

  calculate(){
    var rounds = ReactDOM.findDOMNode(this.refs.rounds).value;
    console.log(rounds)

    var orders = Orders.find({}).fetch();
    var productions = Productions.find({}).fetch();

    var tasks = []
    _.each(orders, (order) => {
      var orderName = order.name;
      var orderId = order._id;

      var ordertasks = _.map(order.productions, (production) => {
        return {id: orderId + production.ref_id, order: orderName, production: production.name}
      });
      console.log(ordertasks)
      tasks = tasks.concat(ordertasks)
    });

    console.log(tasks)

    // process tasks
    // while(tasks.length > 0){
    //
    // }

    // Meteor.call("calculate", rounds, (err, res) => {
    //   if(err){
    //     console.log(err)
    //     Notification.alert(3, err.error, 2.5);
    //   }else{
    //     console.log(res);
    //   }
    // })
  }

  render() {
    return (
      <div>
        <h1>Dashboard</h1>
        <Form>
          <FormGroup>
            <Label>Rounds</Label>
            <Input
            ref="rounds" type="number" defaultValue="100" />
          </FormGroup>
        </Form>
        <p><Button style="primary" onClick={this.calculate.bind(this)}>Calculate</Button></p>
        <p>Diagramm ...</p>
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
