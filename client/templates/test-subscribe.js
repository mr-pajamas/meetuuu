/**
 * Created by Michael on 2015/10/19.
 */
var pivotTime;
var limit;

Template.testSubscribe.onCreated(function () {

  pivotTime = new Date();
  limit = new ReactiveVar(10);

  var template = this;
  template.autorun(function () {
    template.subscribe("docsBefore", pivotTime, limit.get() + 1);
  });

  template.subscribe("docsAfter", pivotTime);
});

Template.testSubscribe.helpers({
  hasMore: function () {
    return TestDocs1.find({time: {$lte: pivotTime}}).count() == limit.get() + 1;
  },
  hasData: function () {
    return !!TestDocs1.find().count();
  },
  docsBefore: function () {
    return TestDocs1.find({time: {$lte: pivotTime}}, {sort: {time: -1}, limit: limit.get()}).fetch().reverse();
  },
  docsAfter: function () {
    return TestDocs1.find({time: {$gt: pivotTime}}, {sort: {time: 1}});
  }
});

Template.testSubscribe.events({
  "click .btn": function () {
    limit.set(limit.get() + 10);
  }
});
