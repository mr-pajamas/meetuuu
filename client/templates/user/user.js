/**
 * Created by cy on 08/10/15.
 */

var singleEvent = new ReactiveVar(null);    //  初始化, 用来存储findOne得到的值。
var hasEvents = new ReactiveVar(null);
var hasWatchingEvents = new ReactiveVar(null);
var hasGroups = new ReactiveVar(null);
var hasWatchingGroups = new ReactiveVar(null);

var viewTimeoutId,
  destoryTimeoutId;


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
        var now = moment();
        var endOfNow = now.endOf("day");
        var endOfStartTime = startTime.endOf("day");
        if (!endOfStartTime.diff(endOfNow)) {
          if (moment(event.time.start).diff(moment()) <= 3600 * 1000) {
            destoryTimeoutId = Meteor.setTimeout(function () {
              setSingleEvent(null);
              Meteor.clearTimeout(destoryTimeoutId);
            }, moment(moment(event.time.end)).diff(moment()));
            setSingleEvent(event);
          } else {
            viewTimeoutId = Meteor.setTimeout(function () {
              setSingleEvent(event);
              Meteor.clearTimeout(viewTimeoutId);
            }, moment(moment(event.time.start)).diff(moment()) - 3600 * 1000);
          }
        }
      }
    }
  });
});

Template.user.onDestroyed(function () {
  // 销毁全局的东西。
  Meteor.clearTimeout(destoryTimeoutId);
  Meteor.clearTimeout(viewTimeoutId);
});

Template.user.onRendered(function () {
  $(document.body).scrollspy({
    target: ".scrollspy-wrap",
    offset: 96
  });

  // 使用一个session 变量在两个页面之间进行通信。

  //  默认是每个Tab 都带上　tab 参数。

  this.autorun(function () {
    var tab = FlowRouter.getParam("tab");
    if (!tab) {
      $("#event-menu").collapse("toggle");
    } else if (tab === "events") {
      $(".collapse").not($("#event-menu")).collapse("hide");
      $("#event-menu").collapse("toggle");
      $("#events-tab").tab("show");
    } else if (tab === "clubs") {
      $(".collapse").not($("#club-menu")).collapse("hide");
      $("#club-menu").collapse("toggle");
      $("#clubs-tab").tab("show");
    } else if (tab === "userInfo") {
      $(".collapse").collapse("hide");
      $("#basic-info-tab").tab("show");
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
    return Events.find({_id: {$in: eventIds}, "time.end": {$gt: new Date()}},{sort: {"time.start": 1}});
    // 这个地方实现了排序，值得一看。
  },
  "eventNow": function () {
    return singleEvent.get();
  },
  "dTemplate": function () {
    var startTime = moment(this.time.start);
    var endTime = moment(this.time.end);
    var tomorrow = moment().add(1,"day");
    singleEvent.get();
    if (endTime.diff(moment()) > 0) {
      //这里的代码需要优化。
      if ( !tomorrow.endOf("day").diff(startTime.endOf("day"))
        || !moment().endOf("day").diff(moment(this.time.start).endOf("day"))) {
        if ( !moment(this.time.start).endOf("day").diff(moment().endOf("day")) ) {
          if (3600 * 1000 < moment(this.time.start).diff(moment())) {
            return "todayOrTomorrowEvent";
          }
        } else {
          return "todayOrTomorrowEvent";
        }
      } else {
        return "calendarEvent";
      }
    }
  },
  "watchingEvents": function () {
    var eventIds = UserSavedEvents.find({"user.id": FlowRouter.getParam("userId")});
    if (eventIds.count()) {
      hasWatchingEvents.set(1);
      return evnetIds;
    } else {
      hasWatchingEvents.set(0);
      return false;
    }
  },
  "hasWatchingEvents": function () {
    return hasWatchingEvents.get();
  },
  "singleWatchEvent": function () {
    return Events.findOne({_id: this.event.id});
  },
  "poster": function () {
    return this.poster ? this.poster : "/event-create-poster-holder.png";
  },
  "eventTime": function () {
    var eventTime = {},
      time = this.time;
    if (time) {
      eventTime.start = moment(time.start).format("MMMM DD");
      eventTime.end = moment(time.end).format("MMMM DD");
    }
    return eventTime;
  },
  "eventGroup": function () {
    return Groups.findOne({_id: this.author.club.id});
  },
  "groups": function () {
    var groups = MyGroups.find();
    if (groups.count()) {
      hasGroups.set(1);
      return groups;
    } else {
      hasGroups.set(0);
      return false;
    }
  },
  "hasGroups": function () {
    return hasGroups.get();
  },
  "groupLogo": function () {
    return this.logoUrl ? this.logoUrl : "/images/default-badge.png";
  },
  "watchingGroupIds": function () {
    var groups = GroupWatchings.find({"userId": Meteor.userId()});
    if (groups.count()) {
      hasWatchingGroups.set(1);
      return groups;
    } else {
      hasWatchingGroups.set(0);
      return false;
    }
  },
  "hasWatchingGroups": function () {
    return hasWatchingGroups.get();
  },
  "watchingGroups": function () {
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
    var targetTab = $(e.currentTarget).attr("id");
    if (targetTab === "events-tab") {
      FlowRouter.setParams({tab: "events"});
    } else if (targetTab === "clubs-tab") {
      FlowRouter.setParams({tab: "clubs"});
    } else if (targetTab === "basic-info-tab") {
      FlowRouter.setParams({tab: "userInfo"});
    }
  },
  "click .scroll-trigger": function (e) {
    var that = e.currentTarget;
    if (location.pathname.replace(/^\//, '') == that.pathname.replace(/^\//, '') && location.hostname == that.hostname) {
      var target = $(that.hash);
      target = target.length ? target : $('[name=' + that.hash.slice(1) + ']');
      if (target.length) {
        $('body, html').animate({
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
  "poster": function () {
    return this.poster ? this.poster : "/event-create-poster-holder.png";
  },
  "eventTime": function () {
    var eventTime = {},
      time = this.time;
    if (time) {
      eventTime.start = moment(time.start).format('M月D日 HH:mm');
      eventTime.end = moment(time.end).format('M月D日 HH:mm');
    }
    return eventTime;
  }
});
