/**
 * Created by jym on 2016/1/15.
 */

/**
 * Created by jym on 2016/1/4.
 */
Template.manageWXUserList.onCreated(function() {
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
  /*"submit #updateUserForm": function(e, template) {
    console.log("Succed");
    template.$(".updateClose").click();
  }*/
})

