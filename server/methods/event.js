Meteor.methods({
  'event.save': function(id, eventInfo) {
    // 更新tags
    eventInfo.tags.forEach(function(tag) {
      EventTag.update({'_id': tag._id}, {$inc: {refers: 1}});
    });
    if (id) {
      // 后续更新
      Events.update({_id: id},{'$set': eventInfo});
      return {code: 0};
    } else {
      // 第一次保存
      var nid = Events.insert(eventInfo);
      return {code: 0, eventId: nid};
    }
  }
});