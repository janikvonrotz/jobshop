import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ReactDOM from 'react-dom';
import { Productions } from '../api/productions.js';
import { Alert, Form, Input, Label, Button } from './bootstrap/index.jsx';

// App component - represents the whole app
export default class ProductionEdit extends Component {

  update(name, value) {
    var production = this.props.production;
    production[name] = value;
    var productionId = production._id
    delete production._id;
    Productions.upsert(productionId, { $set: production});
  }

  remove() {
    var productionId = this.props.production._id
    Productions.remove({_id: productionId});
    FlowRouter.go("/productions");
  }

  render() {
    if(!this.props.production){return (<Alert style="warning">Production loading ...</Alert>)}
    return (
      <div className="production-edit">

        <h1>Edit production</h1>

        <Form>
        <Label>Name</Label>
        <Input
        name="name"
        defaultValue={this.props.production.name}
        onChange={this.update.bind(this)} />
        </Form>
        <Button style="danger" onClick={this.remove.bind(this)}>Delete</Button>
      </div>
    );
  }
}

ProductionEdit.propTypes = {
  production: PropTypes.object.isRequired,
};

export default createContainer(({productionId}) => {
  return {
    production: Productions.find({_id: productionId}).fetch()[0],
  };
}, ProductionEdit);
