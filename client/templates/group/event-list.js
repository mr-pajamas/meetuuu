/**
 * Created by cy on 01/11/15.
 */

var path;

Template.groupEventList.onCreated(function () {
  var template = this;
  path = FlowRouter.getParam("groupPath");
  template.autorun(function () {
    template.subscribe("groupEventList", path);
  });
});

Template.groupEventList.onRendered(function () {
  var template = this;
  // nothing.
});

Template.groupEventList.helpers({
  currentGroupId: function () {
    console.log(path);
    console.log(Groups.findOne({path: path})._id);
    return Groups.findOne({path: path})._id;
  },
  events: function () {
    var groupId = Groups.findOne({path: path})._id;
    console.log(groupId);
    console.log(Events.find({"author.club.path": groupId}, {sort: {"time.start": 1}}));
    return Events.find({"author.club.id": groupId}, {sort: {"time.start": 1}});
  },
  "eventCalendar": function () {
    var eventCalendar = {};
    var startTime = moment(this.time.start);
    eventCalendar.month = startTime.format("MMMM");    // moment().month from 0 to 11.
    eventCalendar.day = startTime.format("DD");
    return eventCalendar;
  },
  "isOvered": function () {
    var endTime = moment(this.time.end);
    var now = moment();
    return now > endTime;
  }
});
