/**
 * Created by cy on 17/10/15.
 */

Meteor.publishComposite("userDetailById", function (uid) {
  return {
    find: function() {
      return JoinForm.find({"userId": uid});
    },
    children: [
      {
        find: function(joinForm) {
          return Events.find({_id: new Mongo.ObjectID(joinForm.eventId), "time.end": {$gt: new Date()}});
        }
      }
    ]
  }
});
Meteor.publish("userDetail", function (uid) {
  return Meteor.users.find({_id: uid});
});
Meteor.publishComposite("userWatchingEvents", function (uid) {
  return {
    find: function () {
      return UserSavedEvents.find({"user.id": uid});
    },
    children: [
      {
        find: function (userSavedEvents) {
          return Events.find({_id: userSavedEvents.event.id});
        },
        children: [
          {
            find: function (event, userSavedEvents) {
              return Groups.find({_id: event.author.club.id});
            }
          }
        ]
      }
    ]
  }
});


// allow rule for user edit his own information.

Meteor.users.allow({
  insert: function (userId, doc) {
    return (userId && doc._id === userId);
  },
  update: function (userId, doc, fields, modifier) {
    return doc._id === userId;
  },
  remove: function (userId, doc) {
    return doc._id === userId;
  },
  fetch: ["_id"]
});
