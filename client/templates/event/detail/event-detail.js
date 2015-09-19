
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

Template.eventDetail.onRendered(function() {
  //created by Chen Yuan. 2015, 09, 18, to bind scrollSpy properties to body tag.

  var self = this;

  $(document.body).scrollspy({
    target: "#navbar-tobe-fixed",
    offset: function () {
      return self.$(".event-home").offset().top;
    }
  });

  // affix event.
  $(".fixed-bar-wrap").affix();

  self.autorun(function() {
    var eid = FlowRouter.getParam('eid');
    self.data.eid = eid;  // 存到template data 中

    // 订阅活动详情
    self.subscribe('eventDetailById', eid, function (err) {
      if (err) {return;}
      // 插入html 字符串，暂时无法直接转换
      var eventDetail = Events.findOne({'_id': self.data.eid});
      if (eventDetail && eventDetail.desc) {
        $('#information').append(eventDetail.desc);
      }
    });
  });
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
      signForm = {};
    _.forEach(forms, function(form) {
      var type = String;
      if (form.isArr) {
        type = [String];
        delete form.isArr;
      }
      form.type = type;
      var opt = form.opts;
      delete form.opts;
      if (
        form.autoform &&
        Object.prototype.toString.call(opt) === '[object Array]' &&
        opt.length !== 0
      ) {
        form.autoform.options = opt;
      }
      var id = form.id;
      delete form.id;
      signForm[id] = form;
    });

    return new SimpleSchema(signForm);
  }
});

Template.eventDetail.events({
  // 提交留言
  'click #submitComment': function(e) {
    e.preventDefault();
    var eid = Template.currentData().eid;
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
          scrollTop: target.offset().top - $('.navbar-fixed-top').outerHeight()
        }, 300);
      }
    }
    return false;
  }
});
