/**
 * Created by jym on 2015/9/30.
 */
Template.forumSingleDiscussion.onCreated(function () {
  console.log(FlowRouter.getParam("discId"));
  this.subscribe('singleDiscussion', FlowRouter.getParam("discId"));
});

Template.forumSingleDiscussion.helpers({
  discussions: function () {
    return Discussion.findOne({_id: FlowRouter.getParam("discId")});
  },

});

Template.forumSingleDiscussion.events({
  "click a .replyBtn": function () {

  },
})
