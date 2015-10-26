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
    console.log(denyInfo);
    var status = '';
    if (denyInfo.forever === true) {
      status = '禁止报名';
    } else {
      status = '拒绝报名';
    }
    var cnt = JoinForm.update({'_id': denyInfo.id}, {$set: {'denyResult': denyInfo.result, 'status': status}});
    return {code: cnt ? 0 : -1};
  },
  'acceptSignForm': function(id) {
    JoinForm.update({'_id': id}, {$set: {'status': '报名成功'}});
  }
});