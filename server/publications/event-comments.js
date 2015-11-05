/*Meteor.publish('eventComments', function(eid) {
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
});*/

Meteor.publishComposite("eventComments", function (eid) {
  return {
    find: function () {
      return EventComments.find({eventId: eid, commentType: 'event'}, {
        fields: {
          commentType: 1,
          eventId: 1,
          content: 1,
          commentBy: 1,
          comments: 1,
          createAt: 1
        }
      });
    },
   children: [
     {
       find: function (eventComments) {
         return Meteor.users.find({_id: eventComments.commentBy.uid}, {fields: {profile: 1}});
       }
     }
   ]
  }
});
