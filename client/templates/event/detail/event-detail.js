
// autoForm hooks
(function() {
  AutoForm.hooks({
    joinEvent: {
      // 人工提交，便于添加 eventId 提交
      onSubmit: function(doc) {
        var eventSignInfo = {};
        eventSignInfo.eventId = FlowRouter.getParam('eid');
        eventSignInfo.signForm = doc;
        Meteor.call('submitJoinForm', eventSignInfo, function(err, res) {
          if (!err && res.code === 0) {
            alert('报名成功');
            $('#joinEventFormModal').modal('hide');
          }
        });
        return false;
      }
    }
  });
}());

var eventDesc = new ReactiveVar('');
Template.eventDetail.onCreated(function () {
  var template = this;
  template.autorun(function() {
    var eid = FlowRouter.getParam('eid');
    // 订阅当前用户是否收藏过活动
    if (Meteor.userId()) {
      template.subscribe('userSavedEvent', Meteor.userId(), new Mongo.ObjectID(eid));
    }
    // 订阅活动详情
    template.subscribe('eventDetailById', new Mongo.ObjectID(eid), function () {
      Tracker.afterFlush(function () {
        $(".event-sidebar").fadeTo("fast", 1);
        $(".mobile-join-wrap").fadeTo("fast", 1);
      });
    });
  });
});

Template.eventDetail.onRendered(function() {
  var self = this;

  $(document.body).scrollspy({
    target: "#navbar-tobe-fixed",
    offset: function () {
      return self.$(".event-home").offset().top;
    }
  });

  // affix event.
  $(".fixed-bar-wrap").affix(); // TODO: 要做bottom
});

//created by Chen Yuan.
Template.eventDetail.onDestroyed(function () {
  $(document.body).scrollspy("destroy");
});
// end.


Template.eventDetail.helpers({
  'eventDetail': function() {
    var eventDetail = Events.findOne({'_id': new Mongo.ObjectID(FlowRouter.getParam('eid'))});
    Meteor.defer(function () {
      $(document.body).scrollspy("refresh");
      $(document.body).scrollspy("process");
    });
    return eventDetail;
  },
  "eventDetailDesc": function () {
    HTTP.get('http://7xjl8x.com1.z0.glb.clouddn.com/' + this.desc, function(err, res) {
      if(!err && res.statusCode === 200) {
        eventDesc.set(res.content);
      }
    });
    return eventDesc.get();
  },
  'optionSignFormTips': function() {
    return !!FlowRouter.getQueryParam('preview') ? '预览报名表单': '我要报名';
  },
  'eventTime': function () {
    var eventTime   = {},
      time = this.time;  // 取了with 中的时间，用于改写格式，此 helper 优先级高于 with
    if (time) {
      // 更改时间格式 ISO -> 2015年9月15日星期二下午5点37分
      eventTime.start = moment(time.start).format('M月D日H点:m分');
      eventTime.end = moment(time.end).format('M月D日H点:m分');
    }
    return eventTime;
  },
  // 提取表单，构造 SimpleSchema
  'signForm': function() {
    var eventDetail = Events.findOne({'_id': new Mongo.ObjectID(FlowRouter.getParam('eid'))});
    if (!eventDetail) {
      return;
    }
    var forms = eventDetail.signForm,
      signForm = EditEvent.eventSignForm.setPreviewForm(forms);
    for (var key in signForm) {
      if (signForm[key].label === '电话') {
        signForm[key].defaultValue = Meteor.user().mobile;
      }
      if (signForm[key].label === '姓名') {
        signForm[key].defaultValue = Meteor.user().profile.name;
      }
    }
    return new SimpleSchema(signForm);
  },
  // 判断当前用户是否收藏过该活动
  'isSaved': function() {
    return UserSavedEvents.findOne()
  },
  // 判断当前用户是否已经报名
  'isJoined': function() {

  }
});

Template.eventDetail.events({
  // 提交留言
  'click #submitComment': function(e) {
    e.preventDefault();
    if (!Meteor.user()) {
      alert('请先登录');
      return;
    }
    var eid = FlowRouter.getParam('eid');
    var commentContent = $('#commentContent').val();
    var comment = {
      commentType: 'event',
      eventId: eid,
      content: commentContent,
      commentBy: {
        username: Meteor.user().profile.name,
        uid: Meteor.userId()
      }
    };
    Meteor.call('submitEventComment', comment, function(err, res) {
      if (!err && res.code === 0) {
        alert('评论成功');
        $('#commentContent').val('');
      }
    });
  },
  // 左侧Tag跟随界面下滑滚动
  'click #fixed-sidebar li a': function (e) {
    var that = e.currentTarget;
    if (location.pathname.replace(/^\//, '') == that.pathname.replace(/^\//, '') && location.hostname == that.hostname) {
      var target = $(that.hash);
      target = target.length ? target : $('[name=' + that.hash.slice(1) + ']');
      if (target.length) {
        $('body').animate({
          scrollTop: target.offset().top - $(".event-home").offset().top
        }, 300);
      }
    }
    return false;
  },
  'click #saveEvent': function() {
    if (!Meteor.userId()) {
      alert('请先登录！');
      return;
    }
    var event = {
      name: this.title,
      id: this._id
    };
    Meteor.call('toggleSaveEvent', event);
  }
});
