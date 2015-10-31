Meteor.methods({
  'event.save': function(eventInfo) {
    // 更新tags
    eventInfo.tags.forEach(function(tag) {
      EventTag.update({'_id': tag._id}, {$inc: {refers: 1}});
    });

    // 插入或者更新
    Events.update({_id: eventInfo._id}, {'$set': _.omit(eventInfo, '_id')}, {upsert: true});

    // 活动海报的更新，  活动详情的更新。
    Meteor.defer(function () {
      var tempEvent = Events.findOne({_id: eventInfo._id}, {fields: {"poster": 1}});

      var newPosterUrl = ObjectStore.putDataUri(eventInfo.poster);

      var result =  Events.update({_id: eventInfo._id}, {$set: {poster: newPosterUrl}});

      if (tempEvent && result) {
        ObjectStore.removeByUrl(tempEvent.poster);
      }
    });

    return {code: 0};
  },
  // 更新活动详情的七牛key
  'updateEventDesc': function(eid, descKey) {
    check(eid, String);
    check(descKey, String);
    Events.update({_id: new Mongo.ObjectID(eid)}, {'$set': {desc: descKey}});
  },
  // 活动详情界面被打开一次，记录一次阅读
  'eventReadInc': function(eid) {
    check(eid, String);
    Events.update({_id: new Mongo.ObjectID(eid)}, {'$inc': {'readCount': 1}});
  },
  'setEventStatus': function(eid, status) {
    check(eid, Mongo.ObjectID);
    check(status, String);
    var cnt = Events.update(eid, {$set: {status: status}});
    return {code: cnt === 1 ? 0 : 1};
  }
});
