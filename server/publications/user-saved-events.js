Meteor.publish('userSavedEvent', function(uid, eid) {
  check(uid, String);
  check(eid, Mongo.ObjectID);
  return UserSavedEvents.find({'event.id': eid, 'user.id': uid});
});