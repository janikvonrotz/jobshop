import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ReactDOM from 'react-dom';
import { Orders } from '../api/orders.js';
import { Productions } from '../api/productions.js';
import { Alert, Form, FormGroup, Input, Label, Button } from './bootstrap/index.jsx';
import Chart from './Chart.jsx';
import * as Notification from 'notie';

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {datasets: []};
  }

  calculate(){
    var rounds = ReactDOM.findDOMNode(this.refs.rounds).value;

    // get data
    var orders = Orders.find({}).fetch();
    var productions = Productions.find({}).fetch();

    // all tasks belong into this array
    var tasks = []

    // get tasks from each order
    _.each(orders, (order) => {
      var orderName = order.name;
      var orderId = order._id;

      // foreach order process productions
      var ordertasks = _.map(order.productions, (production) => {

        // get name and color
        var refProd = _.where(productions, {_id: production.ref_id})[0];

        // these are the tasks
        return {
          id: orderId + production.ref_id,
          orderId: orderId,
          orderName: orderName,
          productionId: production.ref_id,
          productionName: refProd.name,
          duration: parseInt(production.duration),
          color: refProd.color,
          position: order.productions.indexOf(production) + 1,
          start: 0,
          end: 0
        }
      });

      // one array for all tasks
      tasks = tasks.concat(ordertasks)
    });

    // planned tasks belong into this array
    var schedTasks = [];

    // get maximum position of all tasks
    var maxPos = _.sortBy(tasks, (task) => {return -task.position})[0].position;

    // for each position schedule the tasks
    for (pos = 1; pos <= maxPos; pos++) {

      // get task of this position
      var taskByPos = _.where(tasks, {position: pos});

      while(taskByPos.length > 0){

        // get random element
        var task = taskByPos[Math.floor(Math.random()*taskByPos.length)];

        // remove it from the list
        taskByPos = _.without(taskByPos, task);

        // check if common tasks are in scheduled
        beforeTask = _.first(_.sortBy(_.where(schedTasks, {productionId: task.productionId}), (o) => {return -o.end}));

        // set schedule
        if(beforeTask){
          task.start = beforeTask.end;
          task.end = task.start + task.duration;
        }else{
          task.start = 0;
          task.end = task.start + task.duration;
        }

        // check if order tasks is in the same schedule
        // task start must be before other task end
        orderTask = _.first(_.sortBy(_.filter(schedTasks, (f) => {
          return (f.end > task.start && f.orderName == task.orderName);
        }), (o) => {return -o.end}));
        // console.log(orderTask);

        // update schedule
        if(orderTask){
          task.start = orderTask.end;
          task.end = task.start + task.duration;
        }

        // console.log(task.orderName, task.productionName, task.start, task.end);

        // add it to scheduled tasks
        schedTasks.push(task);
      }
    }

    // get the full duration to process tasks
    var duration = _.first(_.sortBy(schedTasks, (task) => {return -task.end})).end;

    // format data for charting
    var data = schedTasks.map((task) => {
      return {
        labelY: task.orderName,
        labelItem: task.productionName,
        start: task.start,
        end: task.end,
        color: task.color,
      }
    });

    // sort by order label
    var data = _.sortBy(data, (task) => {return task.labelY});

    // groupBy Y label
    data = _.groupBy(data, (g) => {return g.labelY});

    // update state
    this.setState({
      datasets: [{
        duration: duration,
        data: data
      }]
    });

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
        <Chart data={this.state.datasets[0]} factor="3" />
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
