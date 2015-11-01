/**
 * Created by Michael on 2015/10/31.
 */
Template.groupHeader.helpers({

});

Template.groupHeader.events({
  "click .navbar-right > li:nth-child(4)": function (event, template) {
    event.preventDefault();
    template.$(".auth-modal").modal();
  },
  "click .navbar-right .dropdown-menu > li:last-child": function () {
    event.preventDefault();
    Meteor.logout();
  }
});
