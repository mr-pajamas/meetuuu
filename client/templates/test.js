/**
 * Created by Michael on 2015/9/18.
 */
Template.test.onRendered(function () {
});

Template.test.helpers({
  "testArray": function () {
    return Session.get("fuck");
  },
  "shitHelper": function () {
    return Session.get("fuck");
  },
  arr: function () {
    return [1, 2, 3];
  }
});
