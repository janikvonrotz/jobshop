import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ReactDOM from 'react-dom';
import { Tasks } from '../api/tasks.js';
import { Blocks } from '../api/blocks.js';
import { Alert } from 'bitsherpa-rope';

import Task from './Task.jsx';
import CollaborativeEditor from './CollaborativeEditor.jsx';

// App component - represents the whole app
export default class App extends Component {

  handleSubmit(event) {
    event.preventDefault();
    // Find the text field via the React ref
    const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();
    Tasks.insert({
      text,
      createdAt: new Date(), // current time
    });
    // Clear form
    ReactDOM.findDOMNode(this.refs.textInput).value = '';
  }

  renderTasks() {
    return this.props.tasks.map((task) => (
      <Task key={task._id} task={task} />
    ));
  }

  render() {
    return (
      <div className="container">

        <h1>Todo List</h1>
        <form className="new-task" onSubmit={this.handleSubmit.bind(this)} >
          <input
            type="text"
            ref="textInput"
            placeholder="Type to add new tasks"
          />
        </form>
        <Alert style="danger">hello</Alert>
        <ul>
          {this.renderTasks()}
        </ul>

        <h1>CollaborativeEditor</h1>

        <CollaborativeEditor />

      </div>
    );
  }
}

App.propTypes = {
  tasks: PropTypes.array.isRequired,
};

export default createContainer(() => {
  return {
    tasks: Tasks.find({}, { sort: { createdAt: -1 } }).fetch(),
    blocks: Blocks.find({}, { sort: { createdAt: -1 } }).fetch(),
  };
}, App);
