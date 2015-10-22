/**
 * Created by cy on 17/10/15.
 */

Meteor.publishComposite("userDetailById", function (uid) {
  return {
    find: function() {
      if (uid === this.userId) {
        return userProfileSchema.find({_id: uid});
      } else {
        this.ready();
      }
    },
    children: [
      {
        find: function(users) {
          return JoinForm.find({"userId": users._id});
          //return JoinForm.find({_id: new Mongo.ObjectID(joinForm.eventId), "time.end": {$gt: new Date()}});
        },
        children: [
          {
            find: function (joinForm, users) {
              return Events.find({_id: new Mongo.ObjectID(joinForm.eventId), "time.end": {$gt: new Date()}});
            }
          }
        ]
      }, {
        find: function (users) {
          return    //查找俱乐部消息。
        }
      }
    ]
  }
});

