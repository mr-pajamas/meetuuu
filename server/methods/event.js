Meteor.methods({
  'event.save': function(eventInfo) {
    // 更新tags
    eventInfo.tags.forEach(function(tag) {
      EventTag.update({'_id': tag._id}, {$inc: {refers: 1}});
    });

    //  判断是否存在该活动。
    var tempEvent = Events.findOne({_id: eventInfo._id});
    if (tempEvent) {
      Meteor.defer(function () {
        Emitter.emit("eventModified", eventInfo);
      });
    } else {
      Meteor.defer(function () {
        Emitter.emit("eventCreated", eventInfo);
      });
    }

    // 插入或者更新
    Events.update({_id: eventInfo._id}, {'$set': eventInfo}, {upsert: true});


    console.log("海报是否存在： " + eventInfo.poster);
    if (eventInfo.poster) {         //  用来判断是否修改了海报。
      // 活动海报的更新，  活动详情的更新。
      Meteor.defer(function () {

        var newPosterUrl = ObjectStore.putDataUri(eventInfo.poster);

        var result = Events.update({_id: eventInfo._id}, {$set: {poster: newPosterUrl}});


        if (tempEvent && result) {
          ObjectStore.removeByUrl(tempEvent.poster);
        }
      });
    }

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
  'setEventStatus': function(eid, status, groupId, privateStatus) {
    check(eid, Mongo.ObjectID);
    check(status, String);
    check(groupId, String);
    check(privateStatus, Boolean);
    //console.log(groupId);
    var cnt;
    if(!Meteor.userId()) return ;
    var myGroup = Memberships.findOne({userId: Meteor.userId(), groupId: groupId, status: "joined"});
    //如果在该分组中
    if(myGroup) {
      console.log(myGroup);
      if(myGroup.role === "owner") {
        console.log(Meteor.userId());
        cnt = Events.update(eid, {$set: {status: status}});
        return {code: cnt === 1 ? 0 : 1};
      } else if(Roles.userIsInRole(Meteor.userId(), ['cancel-event'], 'g'+ groupId)) {
        //如果不具有公开活动的权限而是操作公开活动
        console.log(Roles.userIsInRole(Meteor.userId(), ['create-open-event'], 'g'+ groupId));
        if(!Roles.userIsInRole(Meteor.userId(), ['create-open-event'], 'g'+ groupId) && !privateStatus) {
          return ;
        } else {
          cnt = Events.update(eid, {$set: {status: status}});
          return {code: cnt === 1 ? 0 : 1};
      }
      }
    } else {
      return ;
    }
  },
  "updatePoster": function (eid, datauri) {
    if (datauri && datauri.toString().startsWith("data:")) {
      var tempEvent = Events.findOne({_id: eid}, {fields: {"poster": 1}});

      var newPosterUrl = ObjectStore.putDataUri(datauri);

      var result =  Events.update({_id: eid}, {$set: {poster: newPosterUrl}});


      if (tempEvent && result) {
        ObjectStore.removeByUrl(tempEvent.poster);
      }
    }
  }
});
