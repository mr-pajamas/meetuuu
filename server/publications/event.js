Meteor.publish('eventDetailById', function(eid) {
  check(eid, String);
  return Events.find({'_id': eid});
});