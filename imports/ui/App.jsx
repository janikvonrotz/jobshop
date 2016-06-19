import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ReactDOM from 'react-dom';
import { Orders } from '../api/orders.js';
import { Productions } from '../api/productions.js';
import { Alert, Form, FormGroup, Input, Label, Button, GridRow, GridColumn, Table } from './bootstrap/index.jsx';
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

      // reset position to 1
      var orders = orders.map((order) => {
        order.position = 1;
        order.maxPosition = _.where(tasks, {orderId: order._id}).length;
        return order;
      });

      // as long as the sum of position of all orders is not equel to amount of position
      var sum = orders.length;
      while(sum < (tasks.length + orders.length)){
        // console.log(sum, tasks.length);

        // get available task foreach position
        var availableTasks = [];
        _.each(orders, (order) => {

          // only as long maxPosition is not exceeded
          if(order.maxPosition >= order.position){
            availableTasks.push(_.first(_.where(tasks, {position: order.position, orderName: order.name})));
          }
        })
        // console.log("availableTasks", availableTasks);

        // get random task
        var task = availableTasks[Math.floor(Math.random()*availableTasks.length)];
        // console.log("NEW task",task)

        // check for potential conflict tasks
        var conflictTasks = _.filter(schedTasks, (f) => {
          return (f.productionId == task.productionId) || (f.orderName === task.orderName)
        });

        // sort the list by start
        conflictTasks = _.sortBy(conflictTasks, (o) => {return o.start});
        // console.log("conflictTasks", conflictTasks);

        // look for a gap between end and start of all conflict
        var start = 0;
        var beforeTask = {};
        var afterTask = {};
        _.each(conflictTasks, (conflictTask) => {

          // get minimal end
          var end = (start + task.duration);

          // console.log(start, end, conflictTask)
          // console.log("check if in outside", (conflictTask.start >= start) && (end >= conflictTask.end) )
          // console.log("check if in beteween", (conflictTask.start <= start) && (end <= conflictTask.end) )
          // console.log("check if end in between", (end <= conflictTask.end) && (conflictTask.start < end) )
          // console.log("check if start in between", (conflictTask.start <= start) && (start <= conflictTask.end) )

          // if end before conflict task start then save gap
          if(
            ((conflictTask.start >= start) && (end >= conflictTask.end)) ||
            ((conflictTask.start <= start) && (end <= conflictTask.end)) ||
            ((end <= conflictTask.end) && (conflictTask.start < end)) ||
            ((conflictTask.start <= start) && (start <= conflictTask.end))
          ){
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
          // console.log("beforeTask", beforeTask.orderName, beforeTask.productionName, beforeTask.start, beforeTask.end);
          task.start = beforeTask.start;
          task.end = beforeTask.end;
        }else if(!_.isEmpty(afterTask)){
          // console.log("afterTask", afterTask.orderName, afterTask.productionName, afterTask.start, afterTask.end);
          task.start = afterTask.end;
          task.end = task.start + task.duration;
        }else{
          task.start = 0;
          task.end = task.start + task.duration;
        }
        // console.log("FINAL task", task.orderName, task.productionName, task.start, task.end);

        // add it to scheduled tasks
        schedTasks.push(task);

        // increment position on order
        var orders = orders.map((order) => {
          if(order._id === task.orderId){
            order.position = order.position + 1;
          }
          return order;
        });

        // calculate sum of order positions
        sum = 0;
        _.each(orders, (order) => {
          sum = sum + order.position;
        })
      // end task processing
      }

      // get the full duration to process tasks
      var maxDuration = _.first(_.sortBy(schedTasks, (task) => {return -task.end})).end;

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

      // add delivery due dates to dataset
      deadline = _.groupBy(orders.map((order) => {

        // get duration for each order
        var duration = _.first(_.sortBy(
          _.where(data, {labelY: order.name}), (o) => {return -o.end})).end

        // set max duration for graphs
        if(order.delivery > maxDuration){
          maxDuration = order.delivery
        }

        // get delay for each order
        var delay = duration - order.delivery;

        return {labelY: order.name, delivery: order.delivery, duration: duration, delay: delay}

      }), (g) => {return g.labelY});

      // groupBy label
      data = _.groupBy(data, (g) => {return g.labelY});

      // update dataset state
      datasets.push({
        duration: maxDuration,
        data: data,
        deadline: deadline
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

  // render a table for every charts
  renderChartTable(dataset){
    var items = _.sortBy(_.map(dataset.deadline, (value, key) => {
      return {_id: key, delivery: value[0].delivery, duration: value[0].duration, delay: value[0].delay}
    }), (s) => {return s._id});

    return (<Table headers={["Order", "Delivery", "Duration", "Delay"]} items={items} />)
  }

  // render charts foreach dataset
  renderCharts(datasets){
    return datasets.map((dataset) => {
      return (
        <div>
          <Chart data={dataset} factor="3" />
          {this.renderChartTable(dataset)}
        </div>);
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
