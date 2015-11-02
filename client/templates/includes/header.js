/**
 * Created by Michael on 2015/10/23.
 */
Template.header.helpers({

});

Template.header.events({
  "click .navbar-left > .dropdown-menu > li": function (event) {
    event.preventDefault();
    Meteor.setCity($(event.currentTarget).index());
  },
  "click .navbar-right .dropdown-menu > li:nth-child(5)": function (event) {
    event.preventDefault();
    Meteor.logout();
  }
});
