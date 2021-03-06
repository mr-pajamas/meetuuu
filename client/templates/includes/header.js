/**
 * Created by Michael on 2015/10/23.
 */
Template.header.helpers({

});

Template.header.events({
  "click .navbar-collapse .navbar-right li:not(.dropdown), click .navbar-brand, click .dropdown.navbar-left": function (event, template) {
    template.$(".navbar-collapse").collapse("hide");
  },

  "click .navbar-left > .dropdown-menu > li": function (event) {
    event.preventDefault();
    Meteor.setCity($(event.currentTarget).index());
  },

  "click .navbar-right > li:nth-child(3)": function (event) {
    event.preventDefault();
    Meteor.showLoginModal();
    //template.$(".auth-modal").modal();
  },

  "click .navbar-right .dropdown-menu > li:nth-child(5)": function (event) {
    event.preventDefault();
    Meteor.logout();
  }
});
