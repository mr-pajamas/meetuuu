Meteor.publish('eventDetailById', function(id) {
  check(id, Mongo.ObjectID);
  return Events.find({'_id': id});
});

