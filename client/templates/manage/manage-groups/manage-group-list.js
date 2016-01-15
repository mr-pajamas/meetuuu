/**
 * Created by jym on 2016/1/13.
 */
/**
 * Created by jianyanmin on 16/1/9.
 */
/**
 * Created by jym on 2016/1/4.
 */
Template.manageGroupsList.onCreated(function() {
  this.subscribe("manageAllGroups");
})
Template.manageGroupsList.helpers({
  groupColl:function() {
    return Session.get("groupCollData");
  },
  test: function() {
    return "hello";
  },
  groupsList: function() {
    return Groups.find();
  }
})

Template.manageGroupsList.events({
 /* "submit #updateUserForm": function(e, template) {
    console.log("Succed");
    template.$(".updateClose").click();
  }*/
})

