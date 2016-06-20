import React from 'react';
import Label from './Label.jsx';

export default class Checkbox extends React.Component {

  handleClick(event){
    this.props.onClick(this.props.name, event.target.checked, event);
  }

  render() {
    return(
      <div className="checkbox">
      <Label>
        <input
        type="checkbox"
        name={this.props.name}
        defaultChecked={this.props.defaultChecked}
        onClick={this.handleClick.bind(this)} />
        {this.props.label ? " " + this.props.label : ""}
      </Label>
      </div>
    );
  }
}
