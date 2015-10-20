/**
 * Created by jym on 2015/9/10.
 */
Template.onlyIfLogin.helpers({
  authInProcess: function () {
    return Meteor.loggingIn();
  },
  canShow: function () {
    return Meteor.user();
  }
});
