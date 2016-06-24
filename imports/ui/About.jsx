import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { GridRow, GridColumn, PageHeader } from './bootstrap/index.jsx';

export default class About extends Component {

  render() {
    return (
      <GridRow className="about"><GridColumn className="col-md-8 col-md-offset-2">
        <PageHeader tag="h1">About</PageHeader>
        <p>This app is an approach to solving the jobshop problem. It has been coded by <a href="https://janikvonrotz.ch">Janik von Rotz</a> and is hosted on <a href="https://github.com/janikvonrotz/jobshop">GitHub</a>.</p>
      </GridColumn></GridRow>
    );
  }
}
