
// autoForm hooks
(function() {
  AutoForm.hooks({
    joinEvent: {
      // 人工提交，便于添加 eventId 提交
      onSubmit: function(doc) {
        doc.eventId = FlowRouter.getParam('eid');
        var self = this;
        Meteor.call('submitJoinForm', doc, function(err, res) {
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

Template.eventDetail.onCreated(function () {
  var template = this;
  template.autorun(function() {
    var eid = FlowRouter.getParam('eid');
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
    return this.desc;
  },
  'optionSignFormTips': function() {
    return !!FlowRouter.getQueryParam('preview') ? '预览报名表单': '我要报名';
  },
  'eventTime': function () {
    var eventTime   = {},
      time = this.time;  // 取了with 中的时间，用于改写格式，此 helper 优先级高于 with
    if (time) {
      // 更改时间格式 ISO -> 2015年9月15日星期二下午5点37分
      eventTime.start = moment(time.start).format('LLLL');
      eventTime.end = moment(time.end).format('LLLL');
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
    return new SimpleSchema(signForm);
  }
});

Template.eventDetail.events({
  // 提交留言
  'click #submitComment': function(e) {
    e.preventDefault();
    var eid = FlowRouter.getParam('eid');
    var commentContent = $('#commentContent').val();
    var comment = {
      commentType: 'event',
      eventId: eid,
      content: commentContent,
      // TODO 用户信息
      commentBy: {
        username: 'ck',
        uid: 'abckdefsfs'
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
  }
});
