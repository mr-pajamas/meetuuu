/**
 * Created by Michael on 2015/11/20.
 */
Template.groupMember.onCreated(function () {
  var template = this;

  template.autorun(function () {
    template.memberHandle = template.subscribe("singleGroupMember", FlowRouter.getParam("memberId"));
  });
});

Template.groupMember.helpers({
  member: function () {
    return Memberships.findOne(FlowRouter.getParam("memberId"));
  },

  user: function () {
    return Meteor.users.findOne(this.userId);
  },

  roleName: function () {
    return Template.parentData().roles[this.role].name;
  }
});
