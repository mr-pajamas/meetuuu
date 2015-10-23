/**
 * Created by Michael on 2015/10/23.
 */
Template.groupCreate.onRendered(function () {

  this.autorun(function () {
    Meteor.city();
    Tracker.afterFlush(function () {

    });
  })
});

Template.groupCreate.helpers({
  selectedCity: function () {

    return Meteor.city() == this ? "selected" : null;
  }
});
