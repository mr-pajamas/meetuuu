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


Template.eventDetail.onRendered(function() {
  //tapScrollInit();
  var self = this;
  self.autorun(function() {
    var eid = FlowRouter.getParam('eid');
    // 订阅活动评论
    self.subscribe('eventComments', eid);
    // 订阅活动详情
    self.subscribe('eventDetailById', eid, function (err) {
      if (err) {return;}
      // 插入html 字符串，暂时无法直接转换
      var eventDetail = Events.findOne({'_id': eid});
      if (eventDetail && eventDetail.desc) {
        $('#information').append(eventDetail.desc);
      }
    });
  });
});


Template.eventDetail.helpers({
  'eventDetail': function() {
    var eventDetail = Events.findOne({'_id': FlowRouter.getParam('eid')});
    if (eventDetail && eventDetail.time) {
      // 更改时间格式 ISO -> 2015年9月15日星期二下午5点37分
      eventDetail.time.start = moment(eventDetail.time.start).format('LLLL');
      eventDetail.time.end = moment(eventDetail.time.end).format('LLLL');
    }
    return eventDetail;
  },

})