/**
 * Created by Michael on 2015/10/4.
 */
var userProfileSchema = new SimpleSchema({
  name: {
    type: String,
    label: "姓名",
    index: true
  },
  gender: {
    type: String,
    label: "性别",
    allowedValues: ["男", "女"],
    optional: true
  },
  avatar: {
    type: String,
    label: "头像",
    regEx: SimpleSchema.RegEx.Url,
    optional: true
  },
  traits: {
    type: [Schema.Trait],
    label: "基因",
    defaultValue: []
  },
  sentiment: {
    type: String,
    label: "心情",
    optional: true
  }
});

Meteor.users.attachSchema(new SimpleSchema({
  username: {
    type: String,
    regEx: /^[a-zA-Z0-9_]{3,15}$/,
    optional: true,
    denyUpdate: true
  },
  emails: {
    type: [Object],
    optional: true
  },
  "emails.$.address": {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  "emails.$.verified": {
    type: Boolean
  },
  mobile: {
    type: String,
    regEx: SimpleSchema.RegEx.Mobile,
    index: true,
    unique: true
  },
  createdAt: {
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
  profile: {
    type: userProfileSchema,
    defaultValue: {}
  },
  services: {
    type: Object,
    optional: true,
    blackbox: true
  },
  roles: {
    type: Object,
    optional: true,
    blackbox: true
  }
}));

if (Meteor.isServer) {
  // 自动发布当前用户手机信息
  Meteor.publish(null, function () {
    if (this.userId) {
      //return Meteor.users.find({_id: this.userId}, {fields: {mobile: 1, createdAt: 1, updatedAt: 1}});
      return Meteor.users.find({_id: this.userId}, {fields: {mobile: 1}});
    } else {
      this.ready();
    }
  });

  Meteor.publish("singleUser", function (userId) {
    check(userId, String);
    return Meteor.users.find(userId, {fields: {mobile: 0, services: 0, roles: 0}});
  });
}
