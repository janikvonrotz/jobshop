import { Meteor } from 'meteor/meteor';
import { Productions } from '../imports/api/productions.js';
import { Orders } from '../imports/api/orders.js';

Meteor.methods({
  'calculate'(rounds, fixedOrder) {
    return null;
  }
});

// Meteor.call("calculate", rounds, (err, res) => {
//   if(err){
//     console.log(err)
//     Notification.alert(3, err.error, 2.5);
//   }else{
//     console.log(res);
//   }
// })
