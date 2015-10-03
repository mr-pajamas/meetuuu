// 短网址
var eventShortUrl = new ReactiveVar('加载短网址中......');

Template.eventManage.onRendered(function() {
  var self = this;

  // 获取短网址
  var url = 'http://localhost:3000/event/detail/' + FlowRouter.getParam('eid');
  getShortUrl(eventShortUrl, url, function(surl) {
    // 活动二维码
    $('#eventQrcode').qrcode({width: 200, height: 200, text: surl});
    // 将 canvas 导入 a 标签，提供下载功能
    var dataURL = $('#eventQrcode').find('canvas')[0].toDataURL();
    $('#eventQrcodeDownLoad').attr('href', dataURL);
  });

  self.autorun(function () {
    var eid = FlowRouter.getParam('eid');
    self.subscribe('eventDetailById', new Mongo.ObjectID(eid));
    self.subscribe('eventComments', eid);
    self.subscribe('eventSignInfos', eid);
  });
});

getShortUrl = function(reactiveVar, url, callback) {
  Meteor.call('bdShortUrl', url, function(err, res) {
    if (!err && res.surl) {
      reactiveVar.set(res.surl);
      callback && _.isFunction(callback) && callback(res.surl);
    }
  })
};

Template.registerHelper('formatTimeLLLL', function(time) {
  return moment(time).format('LLLL');
});

Template.registerHelper('formatTimeMDHHmm', function(time) {
  return moment(time).format('M-D  HH:mm');
});


Template.eventManage.helpers({
  'eventInfo': function() {
    return Events.findOne({'_id': new Mongo.ObjectID(FlowRouter.getParam('eid'))});
  },
  'eventShortUrl': function() {
    return eventShortUrl.get();
  },
  'eventCommentCount': function() {
    return EventComments.find({'eventId': FlowRouter.getParam('eid')}).count();
  },
  'eventSignFormCount': function() {
    return JoinForm.find({'eventId': FlowRouter.getParam('eid')}).count();
  },
  'eventSignForms': function() {
    return JoinForm.find({'eventId': FlowRouter.getParam('eid')});
  }
});

Template.eventManage.events({
  'click #event-code': function() {

  }
});

Template.eventManage.events({
  "click .panel-heading": function (e) {
    var target = $(e.currentTarget).data().target;
    $(target).collapse("toggle");
  },
  "click .refuse": function (e) {
    e.stopPropagation();
    var id = $(e.target).attr('data-id');
    $('#denySignRequest').attr('data-id', id);
    $("#refuseModal").modal()
      .on('hidden.bs.modal', function() {
        $("#refuse-reason-form").val('');
        $('#refuse-forever').attr("checked", false);
      });
  },
  "click #denySignRequest": function() {
    var id = $('#denySignRequest').attr('data-id');
    var denyResult = $("#refuse-reason-form").val();
    var refuseForever = $('#refuse-forever').prop("checked");
    var denyInfo = {
      id: id,
      result: denyResult,
      forever: refuseForever
    };
    Meteor.call('denySignRequest', denyInfo, function(err, res) {
      if (!err && res.code === 0) {
        console.log('已经拒绝报名');
        $("#refuse-reason-form").val('');
        $('#refuse-forever').attr("checked", false);
        $("#refuseModal").modal('hide');
      } else {
        alert('拒绝时出错');
      }
    });
  }
});
