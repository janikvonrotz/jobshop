import React from 'react';
// import { Meteor } from 'meteor/meteor';
// import { render } from 'react-dom';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { mount } from 'react-mounter';

import AppContainer from '../imports/ui/AppContainer.jsx';
import App from '../imports/ui/App.jsx';
import OrderList from '../imports/ui/OrderList.jsx';

// Meteor.startup(() => {
//   render(<App />, document.getElementById('render-target'));
// });

FlowRouter.route('/', {
  name: 'index',
  action() {
    mount(AppContainer, {
      main: <App/>,
    });
  },
});

FlowRouter.route('/orders', {
  name: 'index',
  action() {
    mount(AppContainer, {
      main: <OrderList/>,
    });
  },
});
