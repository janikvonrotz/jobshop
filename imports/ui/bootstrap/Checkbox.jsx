import React from 'react';
import Label from './Label.jsx';

export default class Checkbox extends React.Component {

  constructor(props){
    super(props);
    this.state={
      checked: Boolean(props.defaultValue)
    }
  }

  handleClick(event) {
    this.setState({checked: event.target.checked});
    React.findDOMNode(this).value = event.target.value
  }

  render() {
    console.log(this.state, this.props)
    return(
      <div className="checkbox">
      <Label>

        <input
        ref={this.props.ref}
        type="checkbox"
        name={this.props.name}
        checked={this.state.checked}
        onClick={this.handleClick.bind(this)}
        defaultValue={this.state.checked} />

        {this.props.label ? " " + this.props.label : ""}
      </Label>
      </div>
    );
  }
}
