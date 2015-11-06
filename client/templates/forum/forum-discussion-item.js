/**
 * Created by jianyanmin on 15/10/7.
 */
var PAGE_SIZE = 10;
var limit;
var setPageTime;
Template.forumDiscussionItem.onCreated( function () {
  setPageTime = new Date();
  limit = new ReactiveVar(PAGE_SIZE);
  var template = this;
  template.autorun(function (){
    template.subscribe('commentItemBefore', FlowRouter.getParam("discId") , parseInt(limit.get()+1), setPageTime);
  });
  template.subscribe('commentItemAfter', FlowRouter.getParam("discId") , setPageTime);
  //console.log(this)
  Discussion.update({_id: FlowRouter.getParam("discId")},{$inc: {viewCount: 1}})
});
Template.forumDiscussionItem.helpers({
  groupPath: function(){
    return FlowRouter.getParam("groupPath");
  },
  flagStatus: function () {
    return (FlowRouter.getQueryParam("flag") === "1" && FlowRouter.getQueryParam("flag")!=null);
  },
  contentFormate: function () {
    if(this.content.indexOf('<img')>=0)
    {
      return  (this.content.substring(0, this.content.indexOf('<img'))).replace(/<[^>]+>/g,"").substring(0,150) ;
    }
    else
    {
      return this.content.replace(/<[^>]+>/g,"").substring(0,150) ;
    }
  },

  existUserData: function () {
    var updateId = FlowRouter.getParam("discId");
    var disc = Discussion.findOne({_id: updateId});
    console.log("csd:"+disc.upVote);
    if (_.include(disc.upVote, Meteor.user()._id)) {
      return true;
    } else {
      return false;
    }
  },
  existData: function () {
    if(Comments.find().count()>0)
      return true;
    else return false;
  },
  commentItemsBefore: function () {
    //,limit: parseInt(FlowRouter.getQueryParam("limitNum"))+1
    return Comments.find({discussionId: FlowRouter.getParam("discId"),createdAt: {$lte: setPageTime}},{sort: {createdAt: -1}, limit: limit.get()}).fetch().reverse();
  },
  commentItemsAfter: function () {
    return Comments.find({createdAt: {$gt: setPageTime}},{sort: {createdAt: 1}});
  },
  canModify: function () {
    return this.userId == Meteor.userId()
  },
  discussionCount: function () {
    var count = Comments.find({createdAt: {$lte: setPageTime}}).count();
    return count == limit.get() + 1;
  }
});

Template.forumDiscussionItem.events({
  "click a.collapseBtn": function (e, template) {
    e.preventDefault();
    if (FlowRouter.getQueryParam("flag") == 1) {
      FlowRouter.setQueryParams({flag: 0});
      console.log(FlowRouter.getQueryParam("flag"));
    } else {
      FlowRouter.setQueryParams({flag: 1});
    }
  },
  "click .upVote":function (e, params) {
    e.preventDefault();
    if (confirm("UpVote  this Discussion?")) {
      var updateId = params.data._id;
      var disc = Discussion.findOne({_id: updateId});
      //console.log(disc);
      if (!disc) {
        throw new Meteor.Error('invalid', 'Discussion not found');
      }
      if (_.include(disc.upVote, Meteor.user()._id)) {
        throw new Meteor.Error('invalid', 'User is exist');
      }
      else {
        //console.log(disc._id);
        Discussion.update(disc._id, {
          $addToSet: {upVote: Meteor.user()._id},
          $inc: {upVoteCount: 1}
        }, function (error, result) {
          // console.log(result);
        });
        // console.log(updateId);
        //Discussion.remove(updateId);
        //Comments.remove({discussionId: updateId});
      }
    }

  },
  "click .load-more": function (e, template) {
    e.preventDefault();
    limit.set(limit.get()+PAGE_SIZE);
  }
});
