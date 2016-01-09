/**
 * Created by jym on 2016/1/8.
 */
Meteor.methods({
  "deleteMangeUser": function(option){
    check(option, String);
    if(Meteor.users.remove(option)) {
      return true;
    } else return false;
  },
  "deleteMangeEvent": function(option) {
    check(option, Object);
    //option = new Mongo.ObjectID(option);
    if(Events.remove({_id: option})) {
      return true;
    } else return false;
  }
})
