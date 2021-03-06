// 短网址
//var eventShortUrl = new ReactiveVar('加载短网址中......');

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

Template.qrcodeTpl.onRendered(function() {
  // 获取短网址
  var shortUrl = Events.findOne({_id: new Mongo.ObjectID(FlowRouter.getParam("eid"))}).dwz;

  //var url = 'http://localhost:3000/event/detail/' + FlowRouter.getParam('eid');

  var qrcode = $('#eventQrcode');

  qrcode.qrcode({width: 200, height: 200, text: shortUrl});

  var dataURL = qrcode.find('canvas')[0].toDataURL();
  $('#eventQrcodeDownLoad').attr('href', dataURL);


  /*getShortUrl = function(reactiveVar, url, callback) {
   Meteor.call('bdShortUrl', url, function(err, res) {
   if (!err && res.surl) {
   reactiveVar.set(res.surl);
   callback && _.isFunction(callback) && callback(res.surl);
   }
   })
   };*/

  /*getShortUrl(eventShortUrl, url, function(surl) {
   // 活动二维码
   if ($('#eventQrcode').length) {
   $('#eventQrcode').qrcode({width: 200, height: 200, text: surl});
   // 将 canvas 导入 a 标签，提供下载功能
   var dataURL = $('#eventQrcode').find('canvas')[0].toDataURL();
   $('#eventQrcodeDownLoad').attr('href', dataURL);
   }
   });*/
});


Template.registerHelper('formatTimeLLLL', function(time) {
  return moment(time).format('LLLL');
});

Template.registerHelper('formatTimeMDHHmm', function(time) {
  return moment(time).format('M-D  HH:mm');
});


Template.eventManage.helpers({
  authEdit: function() {
    var groupId;
    var findEID = Events.findOne({'_id': new Mongo.ObjectID(FlowRouter.getParam('eid'))});
    var privateStatus = findEID.private;
    if (!findEID) {
      return ;
    } else {
      groupId= findEID.author.club.id;
    }
    var membership = Memberships.findOne({userId: Meteor.userId(), groupId: groupId});
    if(membership && membership.role === "owner"){
      return {};
    } else if(Roles.userIsInRole(Meteor.userId(), ['modify-event'], 'g'+ groupId)){
      if(!Roles.userIsInRole(Meteor.userId(), ['create-open-event'], 'g'+ groupId) && !privateStatus) {
        return "disabled";
      } else {return {};}
    } else { return "disabled";}

    /* if (membership) {
     if(membership.role === "owner") {
     return {};
     } else if (Roles.userIsInRole(Meteor.userId(), ['modify-event'], 'g'+ groupId)) {
     return {};
     } else {
     return "disabled";
     }
     }*/
  },
  authLogin: function() {
    if(Meteor.userId()) {
      return true;
    } else {
      return false;
    }
  },
  // 判断当前用户是否有权限查看俱乐部管理页面
  'hasViewRight': function() {
    var findEID = Events.findOne({'_id': new Mongo.ObjectID(FlowRouter.getParam('eid'))});
    if (!findEID) {
      return ;
    }
    var myGroup =MyGroups.find().fetch();
    if (!myGroup) {
      return ;
    }
    var groupId = findEID.author.club.id;
    var privateStatus = findEID.private;
    if(myGroup) {
      //如果有聚乐部
      var getMyGroupId = MyGroups.findOne({_id: groupId});
      //如果我在该分组
      if(getMyGroupId) {
        var membership = Memberships.findOne({userId: Meteor.userId(), groupId: groupId});
        if(membership.role === "owner") {
          return true;
          //是不是具有发帖权限
        } else if(Roles.userIsInRole(Meteor.userId(), ['create-event'], 'g'+ groupId)) {
          return true;
        } else {
          return false;
        }
      } else {
        alert("you are not in this group");
        return false;
      }
    } else {
      alert("no group find");
      return false;
    }
  },
  authRefuseForever: function() {
    var event = Events.findOne({'_id': new Mongo.ObjectID(FlowRouter.getParam('eid'))});
    var path = event && 'g' + event.author.club.id;
    var membership = Memberships.findOne({userId: Meteor.userId(), groupId: event.author.club.id});
    if (!Roles.userIsInRole(Meteor.userId(), ['block-entry'], path) && !(membership.role === "owner")) {
      return "disabled";
    }
    return {};
  },
 /* authPostEvent: function() {
    if (!Meteor.userId()) {
      return false;
    }
    var event = Events.findOne({'_id': new Mongo.ObjectID(FlowRouter.getParam('eid'))});
    var path = event && 'g' + event.author.club.id;
    var privateStatus = event.private;
    var membership = Memberships.findOne({userId: Meteor.userId(), groupId: event.author.club.id});
    if(membership.role === "owner") {return true}
    else if (Roles.userIsInRole(Meteor.userId(), ['create-event'], path)) {
      console.log("具有发布活动的权限");
      if(!Roles.userIsInRole(Meteor.userId(), ['create-open-event'], path) && !privateStatus) {
        console.log("具有发布活动的权限，但是没有创建公开活动的权限，而这里是公开活动");
        return false;
      } else {
        return true;
      }
    }
    else { return true;}

  },*/
  authCancelEvent: function() {
    if (!Meteor.userId()) {
      return false;
    }
    var event = Events.findOne({'_id': new Mongo.ObjectID(FlowRouter.getParam('eid'))});
    var path = event && 'g' + event.author.club.id;
    var privateStatus = event.private;
    var membership = Memberships.findOne({userId: Meteor.userId(), groupId: event.author.club.id});
    if(membership && membership.role === "owner"){
     // console.log("我是role");
         return true;
       } else if(Roles.userIsInRole(Meteor.userId(), ['cancel-event'], path)){
         if(!Roles.userIsInRole(Meteor.userId(), ['create-open-event'], path) && !privateStatus) {
           //console.log("我能取消，但是这是个公开活动，我对他没权限");
           return false;
         } else {return true;}
       } else { return false;}
   /* if (!Roles.userIsInRole(Meteor.userId(), ['cancel-event'], path) && !(membership.role === "owner")) {
      // alert('您无权限取消活动');
      return false;
    }
    else { return true;}*/
  },
  'eventInfo': function() {
    return Events.findOne({'_id': new Mongo.ObjectID(FlowRouter.getParam('eid'))});
  },
  'disableCancel': function() {
    var event = Events.findOne({'_id': new Mongo.ObjectID(FlowRouter.getParam('eid'))});
    return event && event.status === '未发布' ? 'hidden': '';
  },
  'eventCommentCount': function() {
    return EventComments.find({'eventId': FlowRouter.getParam('eid')}).count();
  },
  'eventSignFormCount': function() {
    return JoinForm.find({eventId: FlowRouter.getParam('eid'), status:{$ne:"禁止报名"}}).count()
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
    var membership = Memberships.findOne({userId: Meteor.userId(), groupId: event.author.club.id});
    if (!Roles.userIsInRole(Meteor.userId(), ['deny-entry'], path) && !(membership.role === "owner")) {
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
      return false;
    }
    var event = Events.findOne({'_id': new Mongo.ObjectID(FlowRouter.getParam('eid'))});
    var path = event && 'g' + event.author.club.id;
    var membership = Memberships.findOne({userId: Meteor.userId(), groupId: event.author.club.id});
    if (!Roles.userIsInRole(Meteor.userId(), ['cancel-event'], path) && !(membership.role === "owner")) {
      alert('您无权限取消活动');
      return false;
    }
    var eid = FlowRouter.getParam('eid');
    if(confirm("您是否要取消该活动！")) {
      Meteor.call('setEventStatus', new Mongo.ObjectID(eid), '未发布', event.author.club.id, event.private);
    }
  },
  'click #event-publish': function() {
    if (!Meteor.userId()) {
      alert('请先登录！');
      return;
    }
    var eid = FlowRouter.getParam('eid');
    var event = Events.findOne({_id: new Mongo.ObjectID(eid)});
    if(confirm("您是否要发布该活动！")) {
      Meteor.call('setEventStatus', new Mongo.ObjectID(eid), '已发布', event.author.club.id, event.private);
    }
  },


  "click #denySignRequest": function() {
    var id = $('#denySignRequest').attr('data-id');
    var denyResult = $("#refuse-reason-form").val();
    var refuseForever = $('#refuse-forever').prop("checked");
    var event = Events.findOne({'_id': new Mongo.ObjectID(FlowRouter.getParam('eid'))});
    var path = event && 'g' + event.author.club.id;
    var groupId = event.author.club.id;
    var private = event.private;
    var membership = Memberships.findOne({userId: Meteor.userId(), groupId: event.author.club.id});
    var eid = new Mongo.ObjectID(FlowRouter.getParam('eid'))
    if (refuseForever) {
      if (!Roles.userIsInRole(Meteor.userId(), ['block-entry'], path) && !(membership.role === "owner")) {
        alert('您无权限封禁保密');
        return false;
      }
    }

    var denyInfo = {
      id: id,
      result: denyResult,
      forever: refuseForever,
      eid: eid,
      groupId: groupId,
      private: private
    };
    Meteor.call('denySignRequest', denyInfo, function(err, res) {
      if (!err && res.code === 0) {
        alert('拒绝成功');
      } else {
        alert('拒绝时出错');
      }
      $("#refuse-reason-form").val('');
      $('#refuse-forever').attr("checked", false);
      $("#refuseModal").modal('hide');
    });
  }
});

//  返回参加用户的头像.

Template.joinForm.helpers({
  authRefuse: function() {
    var findEID = Events.findOne({'_id': new Mongo.ObjectID(FlowRouter.getParam('eid'))});
    var groupId = findEID.author.club.id;
    var membership = Memberships.findOne({userId: Meteor.userId(), groupId: groupId});
    if(membership.role === "owner") {
      return {};
    } else if (Roles.userIsInRole(Meteor.userId(), ['deny-entry'], 'g'+ groupId)) {
      return {};
    } else {
      return "disabled";
    }
  },
  "joinedUserAvatar": function () {
    return Meteor.users.findOne({_id: this.userId});
  },
  isRefuse: function() {
    if(this.status === "禁止报名") {
      return true;
    } else {
      return false;
    }
  }
});
