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
  organizerId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
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
  watchedCount: {
    type: Number,
    min: 0,
    defaultValue: 0
  }
  // TODO: traits
}));


Memberships = new Meteor.Collection("memberships");

Memberships.attachSchema(new SimpleSchema({
  groupId: {
    type: String,
    denyUpdate: true,
    index: true
  },
  userId: {
    type: String,
    denyUpdate: true,
    index: true
  },
  joinDate: {
    type: Date,
    denyUpdate: true,
    index: true
  }
  // TODO: group-specific profile
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
}

if (Meteor.isClient) {
  MyGroups = new Meteor.Collection("my-groups");
}
