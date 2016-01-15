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
    check(option, Mongo.ObjectID);

    //option = new Mongo.ObjectID(option);
    if(Events.remove({_id: option})) {
      return true;
    } else return false;
  },

  "deleteMangeGroup": function(option) {
     check(option, String);

     //option = new Mongo.ObjectID(option);
     if(Groups.remove({_id: option})) {
       return true;
     } else return false;
   }
})
