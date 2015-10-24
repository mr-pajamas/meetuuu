Meteor.publish('eventSignInfos', function(eid) {
  check(eid, String);
  return JoinForm.find({'eventId': eid, 'status': { $in: ['request', 'accept']}});
});

Meteor.publish('userJoinedEvent', function(eid, uid) {
  check(eid, String);
  check(uid, String);
  return JoinForm.find({'eventId': eid, 'userId': uid}, {fields: {'_id': 1}});
});