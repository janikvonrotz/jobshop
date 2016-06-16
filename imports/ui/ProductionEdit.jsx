import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ReactDOM from 'react-dom';
import { Productions } from '../api/productions.js';
import { Alert, Form, FormGroup, Input, Label, Button, GridRow, GridColumn, PageHeader } from './bootstrap/index.jsx';

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
      <GridRow className="production-edit"><GridColumn className="col-md-8 col-md-offset-2">
        <PageHeader tag="h1">Production Edit</PageHeader>
        <Form>
          <FormGroup>
            <Label>Name</Label>
            <Input
            name="name"
            defaultValue={this.props.production.name}
            onChange={this.update.bind(this)} />
          </FormGroup>
        </Form>
        <p><Button style="danger" onClick={this.remove.bind(this)}>Delete</Button></p>
      </GridColumn></GridRow>
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
