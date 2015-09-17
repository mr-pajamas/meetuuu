Meteor.publish('eventComments', function(eid) {
  check(eid, String);
  return EventComments.find({'eventId': eid, 'commentType': 'event'}, {
    fields: {
      commentType: 1,
      eventId: 1,
      content: 1,
      commentBy: 1,
      comments: 1,
      createAt: 1
    }
  });
});