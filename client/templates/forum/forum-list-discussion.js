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
  console.log(path);
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
  }
});

Template.forumListDiscussion.events({
  "click .load-more": function (e, template) {
    e.preventDefault();
    limit.set(limit.get()+PAGE_SIZE);
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
    }
});
