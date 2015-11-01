var getFormValue = function(targetForm, value) {
  var type = targetForm.type;
  var tempValue = '';
  if (type === 'ESF_SINGLE_TEXT' || type === 'ESF_MULTI_TEXT') {
    tempValue = value;
  }
  if (type === 'ESF_SELECT_RADIO') {
    tempValue = targetForm.options[Number(value)].label;
  }
  if (type === 'ESF_SELECT_CHECKBOX') {
    var multiChecks = value.map(function(index) {
      index = Number(index);
      return targetForm.options[index].label;
    });
    tempValue = multiChecks.join(',');
  }
  return tempValue;
}

Meteor.methods({
  'submitJoinForm': function(joinEvnetsInfo) {
    joinEvnetsInfo.status = '审核中';
    joinEvnetsInfo.userId = Meteor.userId();
    joinEvnetsInfo.createTime = new Date();
    var eventSignForm = Events.findOne({'_id': new Mongo.ObjectID(joinEvnetsInfo.eventId)}).signForm;
    var forms = joinEvnetsInfo.signForm;
    var newForms = [];
    _.keys(forms).map(function(id) {
      var targetForm = _.find(eventSignForm, function(form){ return form.id === id; });
      if (targetForm.label === '姓名') {
        joinEvnetsInfo.cname = getFormValue(targetForm, forms[id]);
      } else if(targetForm.label === '电话') {
        joinEvnetsInfo.telephone = getFormValue(targetForm, forms[id]);
      } else {
        newForms.push({
          label: targetForm.label,
          value: getFormValue(targetForm, forms[id])
        });
      }
    });
    joinEvnetsInfo.signForm = newForms;
    var cnt = JoinForm.update({'userId': joinEvnetsInfo.userId, 'eventId': joinEvnetsInfo.eventId},
      {$set: joinEvnetsInfo}, {upsert: true});
    if (cnt === 1) {
      cnt = Events.update(new Mongo.ObjectID(joinEvnetsInfo.eventId), {$inc: {joinedCount: 1}});
    }
    return {'code': cnt ? 0 : -1};
  },
  'denySignRequest': function(denyInfo) {
        console.log("huuuu");
    console.log("拒绝私有活动"+Roles.userIsInRole(Meteor.userId(), ['deny-entry'], denyInfo.groupId));
       var code={};
       var cnt, ejc;
        if(!Meteor.userId()) return ;
        var myGroup = Memberships.findOne({userId: Meteor.userId(), groupId: denyInfo.groupId, status: "joined"});
        //如果在该分组中
        if(myGroup) {
          if(myGroup.role === "owner") {
            if (denyInfo.forever === true) {
                 status = '禁止报名';
               } else {
                 status = '拒绝报名';
               }
               if(status == '禁止报名') {
                  cnt = JoinForm.update({'_id': denyInfo.id}, {$set: {'denyResult': denyInfo.result, 'status': status}});
                  ejc = Events.update({_id: denyInfo.eid},{$inc:{joinedCount:-1}});
               }
               if(status == '拒绝报名') {
                 cnt = JoinForm.remove({'_id': denyInfo.id});
                 ejc = Events.update({_id: denyInfo.eid},{$inc:{joinedCount:-1}});
               }
          } else if(Roles.userIsInRole(Meteor.userId(), ['deny-entry'], denyInfo.groupId)) {
            console.log("拒绝私有活动"+Roles.userIsInRole(Meteor.userId(), ['deny-entry'], denyInfo.groupId));
            //如果不具有公开活动的权限而是操作公开活动
            if(!Roles.userIsInRole(Meteor.userId(), ['create-open-event'], 'g'+ denyInfo.groupId) && !privateStatus) {
              return ;
            } else {
              if (denyInfo.forever === true) {
                   status = '禁止报名';
                 } else {
                   status = '拒绝报名';
                 }
                 if(status == '禁止报名') {
                   if(!Roles.userIsInRole(Meteor.userId(), ['block-entry'], 'g'+ denyInfo.groupId))
                   {
                     return ;
                   }
                    cnt = JoinForm.update({'_id': denyInfo.id}, {$set: {'denyResult': denyInfo.result, 'status': status}});
                    ejc = Events.update({_id: denyInfo.eid},{$inc:{joinedCount:-1}});
                 }
                 if(status == '拒绝报名') {
                   cnt = JoinForm.remove({'_id': denyInfo.id});
                   ejc = Events.update({_id: denyInfo.eid},{$inc:{joinedCount:-1}});
                 }
          }
          }
        } else {
          return ;
        }
    return {code: cnt && ejc ? 0 : -1};
  },
  'acceptSignForm': function(id) {
    JoinForm.update({'_id': id}, {$set: {'status': '报名成功'}});
  }
});
