import React from 'react';

export default class Input extends React.Component {

  handleChange(event){
    if(this.props.onChange){
      this.props.onChange(this.props.name, event.target.value)
    }
  }

  render(){
    return (
      <input
      name={ this.props.name }
      type={ this.props.type }
      className={ this.props.type === "color" ? "form-control input-color" : "form-control" }
      required={ this.props.required }
      placeholder={ this.props.placeholder }
      disabled={ this.props.disabled }
      onChange={ this.handleChange.bind(this) }
      value={ this.props.value }
      defaultValue={ this.props.defaultValue } />
    );
  }
}
