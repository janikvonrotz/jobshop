import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ReactDOM from 'react-dom';
import { Orders } from '../api/orders.js';
import { Productions } from '../api/productions.js';
import { Alert, Form, FormGroup, Input, Label, Button, GridRow, GridColumn, Table, Checkbox, PageHeader } from './bootstrap/index.jsx';
import Chart from './Chart.jsx';
import * as Notification from 'notie';

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      datasets: [],
      fixedOrder: true,
      showResults: false,
    };
  }

  updateState(key, value, event){
    var state = this.state;
    state[key] = value
    this.setState(state);
  }

  calculate(){

    // get form input
    var rounds = ReactDOM.findDOMNode(this.refs.rounds).value;

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
        conflictTasks = _.sortBy(conflictTasks, (o) => {return o.end});
        // console.log("conflictTasks", conflictTasks);

        // look for a gap between end and start of all conflict
        task.start = 0;
        task.end = (task.start + task.duration);
        _.each(conflictTasks, (conflictTask) => {

          // get minimal end
          task.end = (task.start + task.duration);

          // console.log("before update task", task.orderName, task.productionName, task.start, task.end);
          // console.log("conflict task", conflictTask.orderName, conflictTask.productionName, conflictTask.start, conflictTask.end);
          // console.log("check for order task", (conflictTask.orderName === task.orderName) && this.state.fixedOrder)
          // console.log("check if wrapping", (conflictTask.start >= task.start) && (task.end >= conflictTask.end) )
          // console.log("check if in between", (conflictTask.start <= task.start) && (task.end <= conflictTask.end) )
          // console.log("check if end in between", (task.end <= conflictTask.end) && (conflictTask.start < task.end) )
          // console.log("check if start in between", (conflictTask.start <= task.start) && (task.start <= conflictTask.end) )

          // if task is in conflict move it after the conflict task
          if(
            ((conflictTask.orderName === task.orderName) && this.state.fixedOrder) ||
            ((conflictTask.start >= task.start) && (task.end >= conflictTask.end)) ||
            ((conflictTask.start <= task.start) && (task.end <= conflictTask.end)) ||
            ((task.end <= conflictTask.end) && (conflictTask.start < task.end)) ||
            ((conflictTask.start <= task.start) && (task.start <= conflictTask.end))
          ){
            task.start = conflictTask.end;
            task.end = (task.start + task.duration);
            // console.log("updated task", task.orderName, task.productionName, task.start, task.end);
          }
        });
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
      var deadlines = _.groupBy(orders.map((order) => {

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

      // foreach deadline add sum of delay
      var delay = 0;
      _.map(deadlines, (value, key) => {
        if(value[0].delay > 0){
          delay += value[0].delay;
        }
      });

      // groupBy label
      data = _.groupBy(data, (g) => {return g.labelY});

      // get filtered datasets
      var filteredData = {};

      // update dataset state
      datasets.push({
        duration: maxDuration,
        delay: delay,
        data: data,
        deadline: deadlines
      });
      this.setState({
        datasets: datasets
      });

    // end of a round
    }
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

    if(datasets.length == 0){return (<p></p>)}

    // get filtered tables
    var filteredDatasets = {
      "Best": _.first(_.sortBy(datasets, (s) => {return s.delay})),
      "Worst":  _.first(_.sortBy(datasets, (s) => {return -s.delay})),
      "First": _.first(datasets),
      "Last": _.last(datasets),
    };

    var allResultsHeader, allResults
    if(this.state.showResults){
      var allResultsHeader = <PageHeader tag="h1">All Results</PageHeader>;
      var allResults = datasets.map((dataset) => {
        return (
          <div>
            <Chart data={dataset} factor="3" />
            {this.renderChartTable(dataset)}
          </div>
        );
      });
    }

    // show all results
    return(
      <div>
        {_.map(filteredDatasets, (value, key) => {
          return (
            <div>
              <PageHeader tag="h1">{key}</PageHeader>
              <Chart data={value} factor="3" />
              {this.renderChartTable(value)}
              <p></p>
            </div>
          );
        })}
        {allResultsHeader}
        {allResults}
      </div>
    )
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
            ref="rounds" type="number" defaultValue="10" />
          </FormGroup>
          <Checkbox
          label="Fixed Order"
          name="fixedOrder"
          defaultChecked={true}
          onClick={this.updateState.bind(this)} />
          <Checkbox
          label="Show All Results"
          name="showResults"
          defaultChecked={false}
          onClick={this.updateState.bind(this)} />
        </Form>
        <p><Button style="primary" onClick={this.calculate.bind(this)}>Calculate</Button></p>

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
