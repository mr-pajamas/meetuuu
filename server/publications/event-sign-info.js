Meteor.publish('eventSignInfos', function(eid) {
  check(eid, String);
  return JoinForm.find({'eventId': eid});
});