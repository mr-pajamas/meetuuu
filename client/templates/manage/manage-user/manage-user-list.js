/**
 * Created by jym on 2016/1/4.
 */
Template.manageUserList.onCreated(function() {
  this.subscribe("manageAllUsers");
  Session.set("asd","asd");
})
Template.manageUserList.helpers({
  userColl:function() {
    return Session.get("usersCollData");
  },
  usersLists: function() {
    if(Meteor.users.find()) return 1;
  },
  usersList: function() {
    return Meteor.users.find();
  }
})

Template.manageUserList.events({
  "submit #updateUserForm": function() {
    console.log("Succed");
  }
})

