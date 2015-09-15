Meteor.publish('eventComments', function(eid) {
  check(eid, String);
  return EventComments.find({'eventId': eid}, {
    fields: {
      commentType: 1,
      content: 1,
      commentBy: 1,
      'targetContent.contents': 1,
      createAt: 1,
    }
  });
});