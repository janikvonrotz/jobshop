import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ReactDOM from 'react-dom';
import { Productions } from '../api/productions.js';
import { Alert, Button } from './bootstrap/index.jsx';

export default class ProductionList extends Component {

  insert(event){
    var id = Productions.insert({
      name: "name",
      createdAt: new Date(),
    });
    FlowRouter.go("/productions/" + id)
  }

  renderProductions() {
    return this.props.productions.map((production) => (
      <li key={production._id}><a href={"/productions/" + production._id}>{production.name}</a></li>
    ));
  }

  render() {
    return (

      <div>

        <h1>Production</h1>

        <Button style="primary" onClick={this.insert.bind(this)}>New Production</Button>

        <ul>
          {this.renderProductions()}
        </ul>

      </div>
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
