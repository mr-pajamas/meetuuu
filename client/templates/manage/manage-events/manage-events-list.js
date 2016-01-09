/**
 * Created by jianyanmin on 16/1/9.
 */
/**
 * Created by jym on 2016/1/4.
 */
Template.manageEventsList.onCreated(function() {
  this.subscribe("manageAllEvents");
})
Template.manageEventsList.helpers({
  eventColl:function() {
    return Session.get("eventCollData");
  },
  test: function() {
    return "hello";
  },
  eventsList: function() {
    return Events.find();
  }
})

Template.manageEventsList.events({
 /* "submit #updateUserForm": function(e, template) {
    console.log("Succed");
    template.$(".updateClose").click();
  }*/
})

