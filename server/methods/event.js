Meteor.methods({
  'event.save': function(eventInfo) {
    // 更新tags
    eventInfo.tags.forEach(function(tag) {
      EventTag.update({'_id': tag._id}, {$inc: {refers: 1}});
    });
    // 插入或者更新
    Events.update({_id: eventInfo._id}, {'$set': _.omit(eventInfo, '_id')}, {upsert: true});
    return {code: 0};
  },
  'updateEventDesc': function(eid, descKey) {
    Events.update({_id: new Mongo.ObjectID(eid)}, {'$set': {desc: descKey}});
  }
});