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

});

Template.groupCreate.events({
  "submit .group-create-container > form": function (event, template) {
    event.preventDefault();
    if (!Meteor.user()) {
      template.$(".auth-modal").modal();
    } else {
      alert("你好，" + Meteor.user().profile.name);
    }
  },
  "login.muuu .auth-modal": function (event, template) {

  }
});
