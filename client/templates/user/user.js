/**
 * Created by cy on 08/10/15.
 */

var singleEvent = new ReactiveVar(null);    //  初始化, 用来存储findOne得到的值。

function setSingleEvent(event) {            // 在 reactive之前，先刷新 scroll-spy.
  Tracker.afterFlush(function () {
    $(document.body).scrollspy("refresh");
    $(document.body).scrollspy("process");
  });
  singleEvent.set(event);
}

Template.user.onCreated(function () {
  var template = this;
  this.autorun(function () {
    var uid = FlowRouter.getParam('uid');
    if ( uid === Meteor.userId() ) {
      template.subscribe("userDetailById", uid);
    }
  });
  this.autorun(function () {
    if (template.subscriptionsReady()) {        // 用来等待数据加载完毕。
      var eventIds = JoinForm.find({userId: "007"}).map(function (doc) {
        return new Mongo.ObjectID(doc.eventId);
      });
      var event = Events.findOne({_id: {$in: eventIds}, "time.end": {$gt: new Date()}}, {sort: {"time.start": 1}});
      var startTime = moment(event.time.start);
      var endTime = moment(event.time.end);
      var now = moment();
      var startTimeDiff = startTime.diff(now);
      if (startTimeDiff <= 24 * 3600 * 1000) {
        if (startTimeDiff <= 3600 * 1000) {
          var tId = Meteor.setTimeout(function () {
            setSingleEvent(null);
            Meteor.clearTimeout(tId);
          }, endTime.diff(now));
          setSingleEvent(event);
        } else {
          var timeoutId = Meteor.setTimeout(function () {
            setSingleEvent(event);
            Meteor.clearTimeout(timeoutId);
          }, startTimeDiff - 3600 * 1000);
        }
      }
    }
  });
});

Template.user.onRendered(function () {
  $(document.body).scrollspy({
    target: ".scrollspy-wrap",
    offset: 96
  });
});

Template.user.helpers({
  "events": function () {

    var eventIds = JoinForm.find({userId: "007"}).map(function (doc) {
      return new Mongo.ObjectID(doc.eventId);
    });
    return Events.find({_id: {$in: eventIds}},{sort: {"time.start": 1}});
    // 这个地方实现了排序，值得一看。
  },
  "eventNow": function () {
    return singleEvent.get();
  },
  "dTemplate": function () {
    var startTime = moment(this.time.start);
    var endTime = moment(this.time.end);
    var now = moment();
    var startTimeDiff = startTime.diff(now);
    singleEvent.get();
    if (endTime.diff(now) > 0) {
      if (startTimeDiff <= 48 * 3600 * 1000) {
        if (startTimeDiff <= 24 * 3600 * 1000) {
          if (3600 * 1000 < startTimeDiff) {
            return "todayOrTomorrowEvent";
          }
        }
      } else {
        return "calendarEvent";
      }
    }
  },
  "groups": function () {
    return // TODO: group data here.
  },
  "focusedGroups": function () {
    return // TODO:  my focused group data here.
  },
  "basicInfo": function () {
    return  userProfileSchema.findOne({_id: Meteor.userId()});
  }
});

Template.user.onDestroyed(function () {
  $(document.body).scrollspy("destroy");
});

Template.user.events({
  "click .user-tab": function (e) {
    e.preventDefault();
    var target = $(e.currentTarget).data().accordion;
    $(".collapse").not($(target)).collapse("hide");
    $(target).collapse("toggle");
    $(e.currentTarget).tab("show");
  },
  "click .scroll-trigger": function (e) {
    var that = e.currentTarget;
    if (location.pathname.replace(/^\//, '') == that.pathname.replace(/^\//, '') && location.hostname == that.hostname) {
      var target = $(that.hash);
      target = target.length ? target : $('[name=' + that.hash.slice(1) + ']');
      if (target.length) {
        $('body').animate({
          scrollTop: target.offset().top - 61
          // TODO:  这里的61需要优化，以便能够适应更多情况。
        }, 300);
      }
    }
    return false;
  }
});


// todayOrTomorrowEvent template and calendarEvent template 's helpers.
//  目前先这样，三个模板。

Template.todayOrTomorrowEvent.helpers({
  "eventTodayOrTomorrow": function () {
    var eventTodayOrTomorrow = {};
    var startTime = moment(this.time.start);
    var now = moment();
    if (startTime.date() === now.date()) {
      eventTodayOrTomorrow.eventDiffTimes = "今天";
      eventTodayOrTomorrow.today = true;
    } else if (startTime.date() - now.date() === 1) {
      eventTodayOrTomorrow.today = false;
      eventTodayOrTomorrow.eventDiffTimes = "明天";
    }
    eventTodayOrTomorrow.eventHour = startTime.format("HH");
    eventTodayOrTomorrow.eventMinute = startTime.format("mm");
    return eventTodayOrTomorrow;
  }
});

Template.calendarEvent.helpers({
  "eventCalendar": function () {
    var eventCalendar = {};
    var startTime = moment(this.time.start);
    eventCalendar.month = startTime.format("MMMM");    // moment().month from 0 to 11.
    eventCalendar.day = startTime.format("DD");
    return eventCalendar;
  }
});

Template.doingEvent.helpers({
  "eventTime": function () {
    var eventTime = {},
      time = this.time;
    if (time) {
      eventTime.start = moment(time.start).format("LLLL");
      eventTime.end = moment(time.end).format("LLLL");
    }
    return eventTime;
  }
});
