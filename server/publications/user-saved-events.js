// 用户收藏/取消收藏活动
Meteor.publish('userSavedEvent', function(uid, eid) {
  check(uid, String);
  check(eid, Mongo.ObjectID);
  return UserSavedEvents.find({'event.id': eid, 'user.id': uid});
});


// 活动被关注收藏的次数，只发布field
Meteor.publish('eventSavedCount', function(eid) {
  check(eid, String);
  return UserSavedEvents.find({'event.id': new Mongo.ObjectID(eid)}, {fields: {'_id': 1}});
});