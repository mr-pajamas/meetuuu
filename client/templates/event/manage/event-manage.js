// 短网址
var eventShortUrl = new ReactiveVar('加载短网址中......');


Template.qrcodeTpl.onRendered(function() {
  // 获取短网址
  var url = 'http://localhost:3000/event/detail/' + FlowRouter.getParam('eid');
  getShortUrl(eventShortUrl, url, function(surl) {
    // 活动二维码
    if ($('#eventQrcode').length) {
      $('#eventQrcode').qrcode({width: 200, height: 200, text: surl});
      // 将 canvas 导入 a 标签，提供下载功能
      var dataURL = $('#eventQrcode').find('canvas')[0].toDataURL();
      $('#eventQrcodeDownLoad').attr('href', dataURL);
    }
  });
});

Template.eventManage.onCreated(function() {
  var self = this;
  self.autorun(function () {
    var eid = FlowRouter.getParam('eid');
    self.subscribe('eventDetailById', new Mongo.ObjectID(eid));
    self.subscribe('eventComments', eid);
    self.subscribe('eventSignInfos', eid);
    self.subscribe('eventSavedCount', eid);
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
  // 判断当前用户是否有权限查看俱乐部管理页面
  'hasNoViewRight': function() {
    if (!Meteor.userId()) {
      return true;
    }
    var event = Events.findOne({'_id': new Mongo.ObjectID(FlowRouter.getParam('eid'))});
    var path = event && 'g' + event.author.club.id;
    if (Roles.userIsInRole(Meteor.userId(), ['create-event', 'create-open-event'], path)) {
      return false;
    }
    return true;
  },
  'eventInfo': function() {
    return Events.findOne({'_id': new Mongo.ObjectID(FlowRouter.getParam('eid'))});
  },
  'disableCancel': function() {
    var event = Events.findOne({'_id': new Mongo.ObjectID(FlowRouter.getParam('eid'))});
    return event && event.status === '未发布' ? 'hidden': '';
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
  'eventWatched': function() {
    return UserSavedEvents.find().count();
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
    var event = Events.findOne({'_id': new Mongo.ObjectID(FlowRouter.getParam('eid'))});
    var path = event && 'g' + event.author.club.id;
    if (!Roles.userIsInRole(Meteor.userId(), ['deny-entry'], path)) {
      alert('您无权拒绝报名');
      return false;
    }
    e.stopPropagation();
    var id = $(e.target).attr('data-id');
    $('#denySignRequest').attr('data-id', id);
    $("#refuseModal").modal()
      .on('hidden.bs.modal', function() {
        $("#refuse-reason-form").val('');
        $('#refuse-forever').attr("checked", false);
      });
  },
  "click .accept": function (e) {
    var event = Events.findOne({'_id': new Mongo.ObjectID(FlowRouter.getParam('eid'))});
    var path = event && 'g' + event.author.club.id;
    if (!Roles.userIsInRole(Meteor.userId(), ['deny-entry'], path)) {
      alert('您无权限通过报名');
      return false;
    }
    e.stopPropagation();
    var id = $(e.target).attr('data-id');
    Meteor.call('acceptSignForm', id);
  },
  'click #event-cancel': function() {
    if (!Meteor.userId()) {
      alert('请先登录！');
      return;
    }
    var event = Events.findOne({'_id': new Mongo.ObjectID(FlowRouter.getParam('eid'))});
    var path = event && 'g' + event.author.club.id;
    if (!Roles.userIsInRole(Meteor.userId(), ['cancel-event'], path)) {
      alert('您无权限取消活动');
      return false;
    }
    var eid = FlowRouter.getParam('eid');
    Meteor.call('setEventStatus', new Mongo.ObjectID(eid), '未发布');
  },
  'click #event-publish': function() {
    if (!Meteor.userId()) {
      alert('请先登录！');
      return;
    }
    var eid = FlowRouter.getParam('eid');
    Meteor.call('setEventStatus', new Mongo.ObjectID(eid), '已发布');
  },

  "click #denySignRequest": function() {
    var id = $('#denySignRequest').attr('data-id');
    var denyResult = $("#refuse-reason-form").val();
    var refuseForever = $('#refuse-forever').prop("checked");
    var event = Events.findOne({'_id': new Mongo.ObjectID(FlowRouter.getParam('eid'))});
    var path = event && 'g' + event.author.club.id;
    if (refuseForever) {
      if (!Roles.userIsInRole(Meteor.userId(), ['block-entry'], path)) {
        alert('您无权限封禁保密');
        return;
      }
    }

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

//  返回参加用户的头像.

Template.joinForm.helpers({
  "joinedUserAvatar": function () {
    return Meteor.users.findOne({_id: this.userId});
  }
});
