import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ReactDOM from 'react-dom';
import { Orders } from '../api/orders.js';
import { Productions } from '../api/productions.js';
import { Alert, Form, FormGroup, Input, Label, Button, GridRow, GridColumn } from './bootstrap/index.jsx';
import Chart from './Chart.jsx';
import * as Notification from 'notie';

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {datasets: []};
  }

  calculate(){

    // get form input
    var rounds = ReactDOM.findDOMNode(this.refs.rounds).value;
    var maxDuration = ReactDOM.findDOMNode(this.refs.maxDuration).value;

    // reset datasets
    this.setState({
      datasets: []
    });
    var datasets = [];

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

    // create mutliple result sets
    for(var i = 1; i <= rounds; i++){

      // planned tasks belong into this array
      var schedTasks = [];

      // get maximum position of all tasks
      var maxPos = _.sortBy(tasks, (task) => {return -task.position})[0].position;

      // for each position schedule the tasks
      for (pos = 1; pos <= maxPos; pos++) {

        // get tasks for current position
        var taskByPos = _.where(tasks, {position: pos});

        // process every task in this position
        while(taskByPos.length > 0){

          // get random task
          var task = taskByPos[Math.floor(Math.random()*taskByPos.length)];

          // remove it from the position list
          taskByPos = _.without(taskByPos, task);

          // check for potential conflict tasks
          var conflictTasks = _.filter(schedTasks, (f) => {
            return (f.productionId == task.productionId) || (f.orderName === task.orderName)
          });

          // sort the list by start
          conflictTasks = _.sortBy(conflictTasks, (o) => {return o.start});

          console.log("task", task.orderName, task.productionName);
          console.log("conflictTasks", conflictTasks);

          // look for a gap between end and start of all conflict
          var start = 0;
          var beforeTask = {};
          var afterTask = {};
          _.each(conflictTasks, (conflictTask) => {

            // get minimal end
            var end = (start + task.duration);

            console.log(start, end, conflictTask)
            console.log("end", (end < conflictTask.end) && (conflictTask.start < end) )
            console.log("start", (conflictTask.start < start) && (start < conflictTask.end) )
            console.log("zero", (conflictTask.start == 0) && (start == 0) )

            // if end before conflict task start then save gap
            if(
            // ((conflictTask.start == 0) && (start == 0)) ||
            ((end <= conflictTask.end) && (conflictTask.start <= end)) ||
            ((conflictTask.start <= start) && (start <= conflictTask.end))){
              afterTask = conflictTask;
              beforeTask = {};
              start = conflictTask.end;
            // else reset gap and move start and save gap
            }else{
              afterTask = {};
              beforeTask = {
                start: start,
                end: end,
              }
            }
          });

          // set schedule
          if(!_.isEmpty(beforeTask)){
            console.log("beforeTask", beforeTask.orderName, beforeTask.productionName, beforeTask.start, beforeTask.end);
            task.start = beforeTask.start;
            task.end = beforeTask.end;
          }else if(!_.isEmpty(afterTask)){
            console.log("afterTask", afterTask.orderName, afterTask.productionName, afterTask.start, afterTask.end);
            task.start = afterTask.end;
            task.end = task.start + task.duration;
          }else{
            task.start = 0;
            task.end = task.start + task.duration;
          }

          console.log("FINAL task", task.orderName, task.productionName, task.start, task.end);

          // add it to scheduled tasks
          schedTasks.push(task);
        }

      // end of position loop
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

      // groupBy label
      data = _.groupBy(data, (g) => {return g.labelY});

      // update dataset state
      datasets.push({
        duration: duration,
        data: data
      });
      this.setState({
        datasets: datasets
      });

    // end of a round
    }

    // Meteor.call("calculate", rounds, (err, res) => {
    //   if(err){
    //     console.log(err)
    //     Notification.alert(3, err.error, 2.5);
    //   }else{
    //     console.log(res);
    //   }
    // })
  }

  // render charts foreach dataset
  renderCharts(datasets){
    return datasets.map((dataset) => {
      return (<Chart data={dataset} factor="3" />);
    })
  }

  render() {
    return (
      <div className="dashboard">
        <h1>Dashboard</h1>
        <GridRow>
        <GridColumn className="col-sm-4">

        <Form>
          <FormGroup>
            <Label>Rounds</Label>
            <Input
            ref="rounds" type="number" defaultValue="1" />
          </FormGroup>
          <FormGroup>
            <Label>Duration Maximum</Label>
            <Input
            ref="maxDuration" type="number" defaultValue="100" />
          </FormGroup>
        </Form>
        <p><Button style="primary" onClick={this.calculate.bind(this)}>Calculate</Button></p>

        </GridColumn>
        <GridColumn className="col-sm-6">
          <p>Tabulist</p>
        </GridColumn>
        </GridRow>
        <GridRow className="charts">
        <GridColumn className="col-sm-12">

        {this.renderCharts(this.state.datasets)}

        </GridColumn>
        </GridRow>
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
