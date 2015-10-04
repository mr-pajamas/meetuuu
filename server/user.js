/**
 * Created by Michael on 2015/10/3.
 */
new SimpleSchema({
  username: {
    type: String,
    regEx: /^[a-zA-Z0-9_]{3,15}$/
  }
});

// 自动发布当前用户手机信息
Meteor.publish(null, function () {
  if (this.userId) {
    return Meteor.users.find({_id: this.userId}, {fields: {mobile: 1}});
  } else {
    this.ready();
  }
});
