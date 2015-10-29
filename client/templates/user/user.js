/**
 * Created by cy on 08/10/15.
 */

var singleEvent = new ReactiveVar(null);    //  初始化, 用来存储findOne得到的值。
var hasEvents = new ReactiveVar(false);

function setSingleEvent(event) {            // 在 reactive data set之前，先刷新 scroll-spy.
  Tracker.afterFlush(function () {
    $(document.body).scrollspy("refresh");
    $(document.body).scrollspy("process");
  });
  singleEvent.set(event);
}

Template.user.onCreated(function () {
  var template = this;
  this.autorun(function () {
    var userId = FlowRouter.getParam('userId');
    template.subscribe("userDetail", userId);
    template.subscribe("userDetailById", userId);
    template.subscribe("userWatchingEvents", userId);
    if (userId === Meteor.userId()) {
      template.subscribe("watchingGroups");
    }
  });
  this.autorun(function () {
    if (template.subscriptionsReady()) {        // 用来等待数据加载完毕。
      var eventIds = JoinForm.find({userId: FlowRouter.getParam('userId')}).map(function (doc) {
        return new Mongo.ObjectID(doc.eventId);
      });
      var event = Events.findOne({_id: {$in: eventIds}, "time.end": {$gt: new Date()}}, {sort: {"time.start": 1}});
      if (event) {      // 这里返回的是一个字符串，所以需要检测它的长度。 如果要在helper里面用到属性，就需要做判断有无数据。
        hasEvents.set(true);
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
    }
  });
});

Template.user.onRendered(function () {
  $(document.body).scrollspy({
    target: ".scrollspy-wrap",
    offset: 96
  });

  // 使用一个session 变量在两个页面之间进行通信。

  this.autorun(function () {
    console.log(FlowRouter.getParam("tab"));
    switch (FlowRouter.getParam("tab")) {
      case undefined :
        FlowRouter.setParams({tab: $(".user-tab")[0].hash});
        $("#event-menu").addClass("in");
        break;
      case "#clubs":
        $("#club-menu").addClass("in");
        $("#clubs").tab("show");
        break;
      case "#basic-info-tab":
        $("#basic-info").tab("show");
    }
  });
});

Template.user.helpers({
  "meOrOther": function () {
    return (Meteor.userId() === FlowRouter.getParam("userId")) ? "我" : "Ta";
  },
  "userJudge": function () {
    return Meteor.userId() === FlowRouter.getParam("userId");
  },
  "hasEvents": function () {
    return hasEvents.get();
  },
  "events": function () {
    var eventIds = JoinForm.find({userId: FlowRouter.getParam("userId")}).map(function (doc) {
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
  "watchingEvents": function () {
    return UserSavedEvents.find({"user.id": FlowRouter.getParam("userId")});
  },
  "singleWatchEvent": function () {
    return Events.findOne({_id: this.event.id});
  },
  "eventTime": function () {
    console.log(this);
    var eventTime = {},
      time = this.time;
    if (time) {
      eventTime.start = moment(time.start).format("MMMM DD");
      eventTime.end = moment(time.end).format("MMMM DD");
    }
    return eventTime;
  },
  "eventGroup": function () {
    return Groups.findOne({_id: singleEvent.author.club.id});
  },
  "groups": function () {
    return MyGroups.find();
  },
  "watchingGroupIds": function () {
    return GroupWatchings.find({"userId": Meteor.userId()});
  },
  "watchingGroups": function () {
    console.log(this.groupId);
    return MyWatchingGroups.findOne({_id: this.groupId});
  },
  "watchingGroupsMemberCount": function () {
    return this.memberCount ? this.memberCount : 0;
  },
  "watchingGroupsEventCount": function () {
    return this.eventCount ? this.eventCount : 0;
  },
  "basicInfo": function () {
    return  Meteor.users.findOne({_id: FlowRouter.getParam("userId")});
  },
  "hasGender": function () {
    return this.profile.gender ? true : false;
  },
  "userGender": function () {
    return this.profile.gender === "男" ? "fa-mars" : "fa-venus";
  }
});

Template.user.onDestroyed(function () {
  $(document.body).scrollspy("destroy");
});

Template.user.events({
  "click .user-tab": function (e) {
    e.preventDefault();
    FlowRouter.setParams({tab: $(e.currentTarget)[0].hash});
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
