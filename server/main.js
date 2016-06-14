import { Meteor } from 'meteor/meteor';
import '../imports/api/productions.js';
import '../imports/api/orders.js';

Meteor.methods({
  'calculate'({results, tabuList}) {
    return "result"
  }
});
