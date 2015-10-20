/**
 * Created by jym on 2015/9/29.
 */

var PAGE_SIZE = 10;
var limit;
Template.listDiscussion.onCreated(function () {
  limit = new ReactiveVar(PAGE_SIZE);
  var template = this;
  template.autorun(function () {
    template.subscribe("listDiscussion", parseInt(limit.get()+1));
  });
});

Template.listDiscussion.helpers({
  listDiscussions: function () {
    return Discussion.find({}, {
      sort: {setTop: -1, createdAt: -1},
      limit: (limit.get())
    });
  },
  discussionCount: function () {
    var count = Discussion.find().count();
    return count == limit.get() + 1;
  }
});

Template.listDiscussion.events({
  "click .load-more": function (e, template) {
    e.preventDefault();
    limit.set(limit.get()+PAGE_SIZE);
  }
});
