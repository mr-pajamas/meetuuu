/**
 * Created by jym on 2016/1/8.
 */
Meteor.methods({
  "deleteMangeUser": function(option){
    check(option, String);
    if(Meteor.users.remove(option)) {
      return true;
    } else return false;
  }
})
