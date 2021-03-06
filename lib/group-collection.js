/**
 * Created by Michael on 2015/10/6.
 */
Groups = new Meteor.Collection("groups");

Groups.attachSchema(new SimpleSchema({
  path: {
    type: String,
    regEx: /^[a-zA-Z0-9_][a-zA-Z0-9_-]{3,19}$/,
    index: true,
    unique: true
  },
  name: {
    type: String,
    index: true,
    unique: true
  },
  founderId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    denyUpdate: true
  },
  foundedDate: {
    type: Date,
    denyUpdate: true
  },
  /*
   updatedAt: {
   type: Date,
   autoValue: function () {
   return new Date();
   }
   },
   */
  homeCity: {
    type: String,
    allowedValues: CITIES
  },
  logoUrl: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true
  },
  memberCount: {
    type: Number,
    min: 1,
    defaultValue: 1
  },
  eventCount: {
    type: Number,
    min: 0,
    defaultValue: 0
  },
  topicCount: {
    type: Number,
    min: 0,
    defaultValue: 0
  },
  watchingCount: {
    type: Number,
    min: 1,
    defaultValue: 1
  },
  memberAlias: {
    type: String,
    optional: true,
    defaultValue: "成员"
  },
  traits: {
    type: [Schema.Trait],
    defaultValue: []
  },
  description: {
    type: String,
    max: 1000,
    defaultValue: "群主已经懒得招呼大家加入了，大家随意，愿者上钩吧……"
  },

  defaultRole: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  roles: {
    type: Object,
    blackbox: true
  },
  // TODO: settings

  privacy: {
    type: Object
  },
  "privacy.concealMembers": {
    type: Boolean,
    optional: true,
    defaultValue: false
  },
  "privacy.concealEvents": {
    type: Boolean,
    optional: true,
    defaultValue: false
  }
}));


Memberships = new Meteor.Collection("memberships");

Memberships.attachSchema(new SimpleSchema({
  groupId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    denyUpdate: true,
    index: true
  },
  userId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    denyUpdate: true,
    index: true
  },
  nickname: {
    type: String,
    index: true
  },
  status: {
    type: String,
    allowedValues: _.values(MemberStatus),
    index: true
  },
  statusUpdatedAt: {
    type: Date
  },
  role: {
    type: String,
    optional: true
  },
  bio: {
    type: String,
    optional: true,
    defaultValue: "懒得写自我介绍了，大家都认识的"
  }

  // TODO: group-specific profile
}));


GroupWatchings = new Meteor.Collection("group-watchings");

GroupWatchings.attachSchema(new SimpleSchema({
  groupId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    denyUpdate: true,
    index: true
  },
  userId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    denyUpdate: true,
    index: true
  }
}));


if (Meteor.isServer) {
  Meteor.publish("singleGroup", function (groupId) {
    return Groups.find(groupId);
  });

  Meteor.publish("singleGroupByPath", function (groupPath) {
    return Groups.find({path: groupPath});
  });

  Meteor.publishComposite(null, {
    find: function () {
      if (!this.userId) return;
      return Memberships.find({userId: this.userId, status: {$ne: MemberStatus.Left}});
    },
    children: [
      {
        collectionName: "my-groups",
        find: function (membership) {
          if (membership.status == MemberStatus.Joined) return Groups.find(membership.groupId);
        }
      }
    ]
  });

  Meteor.publishComposite("onesGroups", function (userId) {
    check(userId, String);
    return {
      find: function () {
        return Memberships.find({userId: userId, status: MemberStatus.Joined});
      },
      children: [
        {
          find: function (membership) {
            return Groups.find(membership.groupId);
          }
        }
      ]
    };
  });

  Meteor.publishComposite("watchingGroups", {
    find: function () {
      if (!this.userId) return;
      return GroupWatchings.find({userId: this.userId});
    },
    children: [
      {
        find: function (groupWatching) {
          return Memberships.find({userId: groupWatching.userId, groupId: groupWatching.groupId, status: {$nin: [MemberStatus.Joined, MemberStatus.Banned]}});
        },
        children: [
          {
            collectionName: "my-watching-groups",
            find: function (membership) {
              return Groups.find(membership.groupId);
            }
          }
        ]
      }
    ]
  });

  Meteor.publish("groups", function (city, selector, options) {
    check(city, Pattern.City);
    check(selector, Match.Optional(Object));
    check(options, Match.Optional(Match.ObjectIncluding({
      sort: Match.Optional(Object),
      limit: Match.Optional(Number)
    })));

    selector = selector || {};
    options = options || {};

    Meteor._ensure(options, "sort");

    selector = _.pick(selector, "path", "name", "founderId", "foundedDate", "memberCount", "eventCount", "topicCount", "watchingCount");
    options.sort = _.pick(options.sort, "path", "name", "founderId", "foundedDate", "memberCount", "eventCount", "topicCount", "watchingCount");

    var _selector = _.extend({homeCity: city}, selector);
    var _options = {};
    if (!_.isEmpty(options.sort)) _options.sort = options.sort;
    if (options.limit) _options.limit = options.limit;

    return Groups.find(_selector, _options);
  });

  Meteor.publishComposite("groupMembers", function (groupId, selector, options) {
    check(groupId, Pattern.NonEmptyString);
    check(selector, Match.Optional(Object));
    check(options, Match.Optional(Match.ObjectIncluding({
      sort: Match.Optional(Object),
      limit: Match.Optional(Number)
    })));

    selector = selector || {};
    options = options || {};

    Meteor._ensure(options, "sort");

    selector = _.pick(selector, "nickname", "status", "statusUpdatedAt", "role");
    options.sort = _.pick(options.sort, "nickname", "status", "statusUpdatedAt", "role");

    return {
      find: function () {
        var _selector = _.extend({groupId: groupId, status: MemberStatus.Joined}, selector);
        var _options = {};
        if (!_.isEmpty(options.sort)) _options.sort = options.sort;
        if (options.limit) _options.limit = options.limit;

        return Memberships.find(_selector, _options);
      },
      children: [
        {
          find: function (membership) {
            return Meteor.users.find(membership.userId, {fields: {mobile: 0, services: 0, roles: 0}});
          }
        }
      ]
    };
  });

  Meteor.publishComposite("singleGroupMember", function (memberId) {
    check(memberId, Pattern.NonEmptyString);

    return {
      find: function () {
        return Memberships.find(memberId);
      },
      children: [
        {
          find: function (membership) {
            return Meteor.users.find(membership.userId, {fields: {mobile: 0, services: 0, roles: 0}});
          }
        }
      ]
    };
  });

  Emitter.on(GroupActionEvent.EventCreated, function (event) {
    Groups.update(event.author.club.id, {$inc: {eventCount: 1}});
  });
  Emitter.on(GroupActionEvent.EventCanceled, function (event) {
    Groups.update(event.author.club.id, {$inc: {eventCount: -1}});
  });
}

if (Meteor.isClient) {
  MyGroups = new Meteor.Collection("my-groups");
  MyWatchingGroups = new Meteor.Collection("my-watching-groups");
}
