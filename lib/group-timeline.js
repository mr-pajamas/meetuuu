/**
 * Created by Michael on 2015/10/30.
 */
GroupTimelineItems = new Meteor.Collection("group-timeline-items");

GroupTimelineItems.attachSchema(new SimpleSchema({
  groupId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    denyUpdate: true,
    index: true
  },
  type: {
    type: String,
    denyUpdate: true
  },
  datetime: {
    type: Date,
    index: -1
  },
  userId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    denyUpdate: true,
    optional: true
  },
  data: {
    type: Object,
    optional: true,
    blackbox: true
  }
}));


if (Meteor.isServer) {
  Meteor.publishComposite("groupTimeline", function (groupId, start, end) {
    check(groupId, String);
    check(start, Match.Optional(Date));
    check(end, Match.Optional(Date));

    return {
      find: function () {
        var _selector = {groupId: groupId};
        if (start) _selector.datetime = {$gte: start};
        if (end) _selector.datetime = _.extend({$lte: end}, _selector.datetime);

        return GroupTimelineItems.find(_selector);
      },
      children: [
        {
          find: function (groupTimelineItem) {
            return Meteor.users.find(groupTimelineItem.userId, {fields: {profile: 1}});
          }
        },
        {
          find: function (groupTimelineItem) {
            return Memberships.find({groupId: groupTimelineItem.groupId, userId: groupTimelineItem.userId});
          }
        }
      ]
    }
  });

  Emitter.on(GroupActionEvent.GroupCreated, function (group) {
    GroupTimelineItems.insert({groupId: group._id, type: "createGroup", datetime: group.foundedDate, userId: group.founderId});
  });

  Emitter.on(GroupActionEvent.GroupModified, function (group, oldGroup, userId) {
    if (group.name != oldGroup.name) {
      GroupTimelineItems.insert({
        groupId: group._id,
        type: "changeGroupName",
        datetime: new Date(),
        userId: userId,
        data: {
          oldName: oldGroup.name
        }
      });
    }

    if (group.logoUrl != oldGroup.logoUrl) {
      GroupTimelineItems.insert({
        groupId: group._id,
        type: "newBadge",
        datetime: new Date(),
        userId: userId
      });
    }
  });

  Emitter.on(GroupActionEvent.MembershipApplied, function (membership) {
    GroupTimelineItems.insert({
      groupId: membership.groupId,
      type: "newApplicant",
      datetime: membership.statusUpdatedAt,
      userId: membership.userId
    });
  });

  Emitter.on(GroupActionEvent.MemberJoined, function (membership) {
    GroupTimelineItems.insert({
      groupId: membership.groupId,
      type: "newMember",
      datetime: membership.statusUpdatedAt,
      userId: membership.userId
    });
  });

  Emitter.on(GroupActionEvent.EventCreated, function (event) {
    GroupTimelineItems.insert({
      groupId: event.author.club.id,
      type: "createEvent",
      datetime: event.createAt || new Date(),
      userId: event.author.id,
      data: {
        eventId: event._id
      }
    });
    GroupTimelineItems.insert({
      groupId: event.author.club.id,
      type: "upcomingEvent",
      datetime: event.time.start,
      data: {
        eventId: event._id
      }
    });
  });

  // TODO: 这里逻辑全得改
  Emitter.on(GroupActionEvent.EventModified, function (event) {
    GroupTimelineItems.update({groupId: event.author.club.id, type: "upcomingEvent", "data.eventId": event._id}, {$set: {datetime: event.time.start}});
  });

  Emitter.on(GroupActionEvent.EventCanceled, function (event) {
    GroupTimelineItems.remove({groupId: event.author.club.id, type: {$in: ["createEvent", "upcomingEvent"]}, "data.eventId": event._id});
  });
}


if (Meteor.isClient) {
  TimelineItemType = {
    createGroup: {
      name: "创立组织",
      faClass: "fa-home"
    },
    changeGroupName: {
      name: "组织更名",
      faClass: "fa-pencil-square-o"
    },
    newBadge: {
      name: "新徽标",
      faClass: "fa-certificate"
    },
    newApplicant: {
      name: "入会申请",
      faClass: "fa-child"
    },
    newMember: {
      name: "新成员",
      faClass: "fa-user-plus"
    },
    createEvent: {
      name: "发布活动",
      faClass: "fa-calendar-plus-o"
    },
    upcomingEvent: {
      name: "即将开始",
      faClass: "fa-calendar-check-o"
    }
  };

  Template.registerHelper("timelineItemName", function () {
    return TimelineItemType[this.type] && TimelineItemType[this.type].name;
  });

  Template.registerHelper("timelineItemFaClass", function () {
    return TimelineItemType[this.type] && TimelineItemType[this.type].faClass;
  });

  Template.registerHelper("timelineItemTemplate", function () {
    return (TimelineItemType[this.type] && TimelineItemType[this.type].template) || "timeline" + capitalizeFirstLetter(this.type);
  });

  function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
