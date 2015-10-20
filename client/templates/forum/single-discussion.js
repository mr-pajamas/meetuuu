/**
 * Created by jym on 2015/9/30.
 */
Template.singleDiscussion.onCreated(function () {
  console.log(FlowRouter.getParam("discId"));
  this.subscribe('singleDiscussion', FlowRouter.getParam("discId"));
});

Template.singleDiscussion.helpers({
  discussions: function () {
    return Discussion.findOne({_id: FlowRouter.getParam("discId")});
  },

});

Template.singleDiscussion.events({
  "click a .replyBtn": function () {

  },
})
