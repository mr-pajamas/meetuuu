/**
 * Created by Michael on 2015/10/31.
 */
Template.timelineMediaLayout.helpers({
  user: function () {
    return Meteor.users.findOne(this.userId);
  }
});
