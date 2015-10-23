/**
 * Created by Michael on 2015/10/6.
 */
Groups = new Meteor.Collection("groups");

Groups.attachSchema(new SimpleSchema({
  // TODO: regEx needed
  path: {
    type: String,
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
  traits: {
    type: [Schema.Trait],
    defaultValue: []
  },
  description: {
    type: String,
    max: 1000
  }

  // TODO: settings
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
  joinDate: {
    type: Date,
    denyUpdate: true
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
      return Memberships.find({userId: this.userId});
    },
    children: [
      {
        collectionName: "my-groups",
        find: function (membership) {
          return Groups.find(membership.groupId);
        }
      }
    ]
  });

  Meteor.publishComposite("onesGroups", function (userId) {
    check(userId, String);
    return {
      find: function () {
        return Memberships.find({userId: userId});
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
        collectionName: "my-watching-groups",
        find: function (groupWatching) {
          return Groups.find(groupWatching.groupId);
        }
      }
    ]
  });
}

if (Meteor.isClient) {
  MyGroups = new Meteor.Collection("my-groups");
  MyWatchingGroups = new Meteor.Collection("my-watching-groups");
}
