// 左侧Tag跟随界面下滑滚动
function tagScroll() {
  /*fix nav bar to the top.*/
  var target = $("#fixed-sidebar");
  var navFixBar = $('.navbar-fixed-top');
  var reference = $(".event-sidebar .content");

  function fixedBar() {
    var Top = reference.offset().top;
    var Width = reference.width();
    var Height = reference.height();
    var navFixBarHeight = navFixBar.height();
    target.width(Width);
    target.height(Height);
    if ($('body').scrollTop() >= Top - navFixBarHeight) {
      target.addClass('fixed-block');
    } else if (target.hasClass('fixed-block')) {
      target.removeClass('fixed-block');
    }
  };
  $(window).on({
    'scroll': fixedBar,
    'resize': fixedBar
  });
  /*fix nav bar end.*/

  var anchors = $("#fixed-sidebar .navi-li a");
  $.each(anchors, function (index, item) {
    $(this).click(function (event) {
      if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
        if (target.length) {
          $('body').animate({
            scrollTop: target.offset().top - navFixBar.height()
          }, 300);
        }
      }
      return false;
    });
  });
}


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
  tagScroll();
  var self = this,
      eid = FlowRouter.getParam('eid');
  self.data.eid = eid;  // 存到template data 中
  self.autorun(function() {
    // 订阅活动评论
    self.subscribe('eventComments', eid);
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


Template.eventDetail.helpers({
  'eventDetail': function() {
    var eventDetail = Events.findOne({'_id': FlowRouter.getParam('eid')});
    return eventDetail;
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
    var eventDetail = Events.findOne({'_id': FlowRouter.getParam('eid')});
    if (!eventDetail) {
      return;
    }
    var signForm = eventDetail.signForm;
    for (var key in signForm) {
      if (signForm.hasOwnProperty(key)) {
        var type = String;
        if (signForm[key].isArr) {
          type = [String];
          delete signForm[key].isArr;
        }
        signForm[key].type = type;
        var opt = signForm[key].opts;
        delete signForm[key].opts;
        if (
          signForm[key].autoform &&
          Object.prototype.toString.call(opt) === '[object Array]' &&
          opt.length !== 0
        ) {
          signForm[key].autoform.options = opt;
        }
      }
    }
    return new SimpleSchema(signForm);
  },
  'comments': function() {
    var eid = FlowRouter.getParam('eid');
    var replys = EventComments.find({'eventId': eid}, {'sort': {'createAt': -1}});
    var fc = replys.map(function(reply) {
      // 更新留言时间
      reply.createAt = moment(reply.createAt).fromNow();
      // 更新子评论时间
      if (reply.comments && reply.comments.length > 0) {
        reply.comments = reply.comments.map(function(comment) {
          comment.createAt = moment(comment.createAt).fromNow();
          return comment;
        });
      }
      return reply;
    });
    return fc;
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
  }
});