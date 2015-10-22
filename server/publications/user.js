/**
 * Created by cy on 17/10/15.
 */
Meteor.publishComposite("userDetailById", {
  find: function() {
    return JoinForm.find({userId: "007"});
  },
  children: [
    {
      find: function(joinForm) {
        return Events.find({_id: new Mongo.ObjectID(joinForm.eventId), "time.end": {$gt: new Date()}});
      }
    }
  ]
});

