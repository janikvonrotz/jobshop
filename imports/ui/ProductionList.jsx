import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ReactDOM from 'react-dom';
import { Productions } from '../api/productions.js';
import { Alert, Button, ListGroup, GridRow, GridColumn, PageHeader } from './bootstrap/index.jsx';

export default class ProductionList extends Component {

  insert(event){
    var id = Productions.insert({
      name: "name",
      createdAt: new Date(),
    });
    FlowRouter.go("/productions/" + id)
  }

  renderProductions() {
    var items = this.props.productions.map((item) => {
      return {key: item._id, label: item.name, href: "/productions/" + item._id };
    });
    return (<ListGroup linked="true" items={items} />);
  }

  render() {
    return (
      <GridRow className="production-list"><GridColumn className="col-md-8 col-md-offset-2">
        <PageHeader tag="h1">Production</PageHeader>
        <p><Button style="primary" onClick={this.insert.bind(this)}>New Production</Button></p>
        {this.renderProductions()}
      </GridColumn></GridRow>
    );
  }
}

ProductionList.propTypes = {
  productions: PropTypes.array.isRequired,
};

export default createContainer(() => {
  return {
    productions: Productions.find({}, { sort: { createdAt: -1 } }).fetch(),
  };
}, ProductionList);
