/**
 * Created by Michael on 2015/10/23.
 */
Template.header.events({
  "click .dropdown-menu > li": function (event) {
    event.preventDefault();
    Meteor.setCity($(event.currentTarget).index());
  }
});
