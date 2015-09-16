// 左侧Tag跟随界面下滑滚动
//function tapScrollInit() {
//  var anchors = $("#fixed-sidebar li a");
//  $.each(anchors, function (index, item) {
//    $(this).click(function (event) {
//      if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
//        var target = $(this.hash);
//        target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
//        if (target.length) {
//          $('html, body').animate({
//            scrollTop: target.offset().top
//          }, 300);
//        }
//      }
//      return false;
//    });
//  });
//};

// autoForm
function autoFormHooks() {
  AutoForm.hooks({
    joinEvent: {
      // 自动提交
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
}

autoFormHooks();

Template.eventDetail.onRendered(function() {
  //tapScrollInit();

  var self = this,
      eid = FlowRouter.getParam('eid');
  self.data.eid = eid;
  self.autorun(function() {
    // 订阅活动评论
    self.subscribe('eventComments', self.data.eid);
    // 订阅活动详情
    self.subscribe('eventDetailById', self.data.eid, function (err) {
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
    if (!eventDetail) {
      return;
    }
    if (eventDetail.time) {
      // 更改时间格式 ISO -> 2015年9月15日星期二下午5点37分
      eventDetail.time.start = moment(eventDetail.time.start).format('LLLL');
      eventDetail.time.end = moment(eventDetail.time.end).format('LLLL');
    }
    // 提取表单，构造 SimpleSchema
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
    eventDetail.signForm = new SimpleSchema(signForm);
    return eventDetail;
  },
});

Template.eventDetail.events({
  'click #nav-join': function(e) {
    var eid = Template.currentData().eid;
    // TODO 报名动作
  },
});