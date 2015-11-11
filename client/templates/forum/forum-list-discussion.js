/**
 * Created by jym on 2015/9/29.
 */

var PAGE_SIZE = 10;
var limit;
var sortType;
Template.forumListDiscussion.onCreated(function () {
  limit = new ReactiveVar(PAGE_SIZE);
  sortType = new ReactiveVar("createdAt");
  var template = this;
 // template.subscribe("singleGroupByPath",FlowRouter.getParam("groupPath"));
  var path = FlowRouter.getParam("groupPath");
  //var groupId = Groups.findOne({path:path});
  var myGroup = MyGroups.findOne({path: path});
  console.log(myGroup.path);
  template.autorun(function () {
    template.subscribe("listDiscussion", parseInt(limit.get()+1), sortType.get(), path);
  });
});

Template.forumListDiscussion.helpers({
  listDiscussions: function () {
    var sort={};
    sort.setTop=-1;
    sort[sortType.get()]=-1;
    return Discussion.find({}, {
      sort: sort,
      limit: (limit.get())
    });
  },
  discussionCount: function () {
    var count = Discussion.find().count();
    return count == limit.get() + 1;
  },
  flagStatus: function () {
        return (FlowRouter.getQueryParam("flag") === "1" && FlowRouter.getQueryParam("flag") != null);
      },
  authCreate: function() {
    var userId = Meteor.userId();
          //获得用户path
          var path = FlowRouter.getParam("groupPath");
          var group = Groups.findOne(path);
          //console.log("分组表"+groupId._id);
          var  groupId = group._id;
          var membership = Memberships.findOne({userId: userId, groupId: groupId});
          if(membership && membership.role === "owner") {
            return {};
          } else if(Roles.userIsInRole(userId, ['create-topic'], 'g'+ groupId)) {
            return {};
          }  else return "hidden";
  }
});
Template.forumListDiscussion.events({
  "click .load-more": function (e, template) {
    e.preventDefault();
    limit.set(limit.get()+PAGE_SIZE);
  },
  "click .manageView": function(e, template) {
    if (FlowRouter.getQueryParam("flag") == 1) {
          FlowRouter.setQueryParams({flag: 0});
          console.log(FlowRouter.getQueryParam("flag"));
        } else {
          FlowRouter.setQueryParams({flag: 1});
        }
  },
  "click .forum-new":function (e, template) {
    sortType.set("createdAt");
    console.log(sortType.get());

  },
  "click .forum-hot":function (e, template) {
    sortType.set("upVoteCount");
    console.log(sortType.get());

    },
  "click .forum-comment":function (e, template) {
    sortType.set("commentCount");
    console.log(sortType.get());
    },
  "change .disc-type": function(e, template) {
    var mySelect = template.$(".disc-type").val();
    //console.log(""+mySelect);
    sortType.set(mySelect);
  }

});
