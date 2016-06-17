import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Alert } from './bootstrap/index.jsx';

export default class Chart extends Component {

  renderChart(data){
    return _.map(data, (value, key) => {
      return (
        <div key={key} className="chart-row">
          {this.renderRowHead(key)}
          {value.map((cell) => {
            return this.renderColumn(cell);
          })}
        </div>
      );
    });
  }

  renderRowHead(text){
    return(
      <div className="chart-row-head">
        <p>{text}</p>
      </div>
    );
  }

  renderColumn(cell){

    var length = (cell.end-cell.start) * this.props.factor;
    var marginLeft = (cell.start * this.props.factor);

    var columnStyle = {
      backgroundColor: cell.color,
      width: length + 'em',
      marginLeft: marginLeft + 'em',
    };

    return(
      <div key={cell.labelY + cell.labelItem} className="chart-column" style={columnStyle}>
        <p>{cell.labelItem}</p>
      </div>
    );
  }

  renderGraph(duration){
    var ticks = [];
    for (var i = 0; i <= duration; i++){
      var tickStyle={
        marginLeft: (i * this.props.factor) + 'em'
      }
      ticks.push(
        <div key={i} className="chart-tick" style={tickStyle}>
          <span>{i}</span>
        </div>
      );
    }
    return (
      <div className="chart-ticks">
        {ticks}
      </div>
    );
  }

  render() {
    if(!this.props.data){return (<Alert style="danger">No Data.</Alert>);}
    return (
      <div className="chart">
        {this.renderChart(this.props.data.data)}
        {this.renderGraph(this.props.data.duration)}
		  </div>
    );
  }
}
