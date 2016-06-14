import React from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { mount } from 'react-mounter';

import AppContainer from '../imports/ui/AppContainer.jsx';
import App from '../imports/ui/App.jsx';
import OrderList from '../imports/ui/OrderList.jsx';
import OrderEdit from '../imports/ui/OrderEdit.jsx';
import ProductionList from '../imports/ui/ProductionList.jsx';
import ProductionEdit from '../imports/ui/ProductionEdit.jsx';

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

FlowRouter.route('/orders/:orderId', {
  name: 'index',
  action({orderId}) {
    mount(AppContainer, {
      main: <OrderEdit orderId={orderId}/>,
    });
  },
});

FlowRouter.route('/productions', {
  name: 'index',
  action() {
    mount(AppContainer, {
      main: <ProductionList/>,
    });
  },
});

FlowRouter.route('/productions/:productionId', {
  name: 'index',
  action({productionId}) {
    mount(AppContainer, {
      main: <ProductionEdit productionId={productionId}/>,
    });
  },
});
