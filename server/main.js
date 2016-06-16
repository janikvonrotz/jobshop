import { Meteor } from 'meteor/meteor';
import { Productions } from '../imports/api/productions.js';
import { Orders } from '../imports/api/orders.js';

Meteor.methods({
  'calculate'(rounds) {
    // throw new Meteor.Error("This failed.");
    var orders = Orders.find({}).fetch();
    var productions = Productions.find({}).fetch();

    var tasks = _.each(orders, (order) => {
      var orderName = order.name;
      return _.each(order.productions, (production) => {
        return {order: orderName, production: production.name}
      });
    })

    var order = orders[Math.floor(Math.random()*orders.length)];

    return tasks;
  }
});
