Meteor.publishComposite("eventSignInfos", function (eid) {
  check(eid, String);
  return {
    find: function () {
      return JoinForm.find({"eventId": eid});
    },
    children: [
      {
        find: function (joinForm) {
          return Meteor.users.find({_id: joinForm.userId});
        }
      }
    ]
  }
});

Meteor.publish('userJoinedEvent', function(eid, uid) {
  check(eid, String);
  check(uid, String);
  return JoinForm.find({'eventId': eid, 'userId': uid}, {fields: {'_id': 1, status: 1}});
});
