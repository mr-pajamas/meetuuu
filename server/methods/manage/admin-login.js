/**
 * Created by jym on 2016/1/6.
 */
Meteor.methods({
  "adminLogin": function(option) {
    var pwd = "admin" ;
    check(option, String);
    if(option == pwd) {
      return true;
    } else return false;
  }

});
