/**
 * Created by Michael on 2015/10/26.
 */
Template.groupHome.onCreated(function () {
  var template = this;

  template.now = new ReactiveVar(new Date());
  template.today = new ReactiveVar(template.now.get());

  (function daily() {
    var today = moment(template.today.get());
    var startOfTomorrow = moment(today).add(1, "d").startOf("day");

    template.dayShiftTid = Meteor.setTimeout(function () {
      //template.dayShiftTid = undefined;
      template.now.set(new Date());
      template.today.set(template.now.get());
      daily();
    }, startOfTomorrow.diff(today));
  }());

  template.autorun(function () {
    var group = Template.currentData();

    template.groupOwnerHandle = template.subscribe("groupMembers", group._id, {role: "owner"});

    Tracker.autorun(function () {
      var today = moment(template.today.get());
      var start = moment(today).subtract(1, "d").startOf("day").toDate();
      var end = moment(today).add(1, "d").endOf("day").toDate();

      template.groupTimelineHandle = template.subscribe("groupTimeline", group._id, start, end);
    });
  });

  template.autorun(function () {
    template.timeShiftTid && (Meteor.clearTimeout(template.timeShiftTid), template.timeShiftTid = undefined);

    template.now.get();
    var now = moment();
    var endOfToday = moment(now).endOf("day").toDate();
    var upcoming = GroupTimelineItems.findOne({datetime: {$gt: now.toDate(), $lte: endOfToday}}, {sort: {datetime: 1}});
    if (upcoming) {
      template.timeShiftTid = Meteor.setTimeout(function () {
        template.timeShiftTid = undefined;
        template.now.set(new Date());
      }, moment(upcoming.datetime).diff(now));
    }
  });
});

Template.groupHome.helpers({
  foundedDate: function () {
    return moment(this.foundedDate).format("ll");
  },
  owner: function () {
    if (Template.instance().groupOwnerHandle.ready()) {
      return Memberships.findOne({groupId: this._id, role: "owner"});
    }
  },
  ownerUser: function () {
    return Meteor.users.findOne(this.userId);
  },
  roleName: function () {
    var group = Template.parentData();
    var role = this.role || group.defaultRole;
    return group.roles[role].name;
  },
  tomorrowTimelineItems: function () {
    var now = moment(Template.instance().now.get());
    var start = moment(now).add(1, "d").startOf("day").toDate();
    var end = moment(now).add(1, "d").endOf("day").toDate();
    return GroupTimelineItems.find({datetime: {$gte: start, $lte: end}}, {sort: {datetime: -1}});
  },
  todayFutureTimelineItems: function () {
    var now = moment(Template.instance().now.get());
    var startExclusive = moment(now).toDate();
    var end = moment(now).endOf("day").toDate();
    return GroupTimelineItems.find({datetime: {$gt: startExclusive, $lte: end}}, {sort: {datetime: -1}});
  },
  todayPastTimelineItems: function () {
    var now = moment(Template.instance().now.get());
    var start = moment(now).startOf("day").toDate();
    var end = moment(now).toDate();
    return GroupTimelineItems.find({datetime: {$gte: start, $lte: end}}, {sort: {datetime: -1}});
  },
  yesterdayTimelineItems: function () {
    var now = moment(Template.instance().now.get());
    var start = moment(now).subtract(1, "d").startOf("day").toDate();
    var end = moment(now).subtract(1, "d").endOf("day").toDate();
    return GroupTimelineItems.find({datetime: {$gte: start, $lte: end}}, {sort: {datetime: -1}});
  }
});

Template.groupHome.events({

});

Template.groupHome.onDestroyed(function () {
  this.timeShiftTid && Meteor.clearTimeout(this.timeShiftTid);
  this.dayShiftTid && Meteor.clearTimeout(this.dayShiftTid);
});

Template.timelineItem.helpers({
  timelineItemData: function () {
    var group = Template.parentData();
    var user = Meteor.users.findOne(this.userId);
    var membership = Memberships.findOne({groupId: this.groupId, userId: this.userId});

    return {groupTimelineItem: this, group: group, user: user, membership: membership};
  }
});
