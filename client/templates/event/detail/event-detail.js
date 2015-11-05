
// autoForm hooks
(function() {
  AutoForm.hooks({
    joinEvent: {
      // 人工提交，便于添加 eventId 提交
      onSubmit: function(doc) {
        if (!Meteor.userId()) {
          alert('请登录！');
          return;
        }
        //  这是前端部分的对报名人数的限制。
        var eventId = FlowRouter.getParam('eid');
        var event = Events.findOne({_id: new Mongo.ObjectID(eventId)});
        if (event) {
          if (event.member && event.status === "已发布") {
            if (event.joinedCount + 1 > event.member) {
              alert("人已经满了，下次早点报名吧!");
              return ;
            } else {
              var eventSignInfo = {};
              eventSignInfo.eventId = eventId;
              eventSignInfo.signForm = doc;
              Meteor.call('submitJoinForm', eventSignInfo, function(err, res) {
                if (!err && res.code === 0) {
                  alert("报名成功了！");
                  $('#joinEventFormModal').modal('hide');
                }
              });
            }
          }
        }
        return false;
      }
    }
  });
}());

var eventDesc = new ReactiveVar('');
Template.eventDetail.onCreated(function () {
  var template = this;
  //打开一次记录一次阅读记录
  var event = Events.findOne({_id: FlowRouter.getParam("eid")});
  if (event) {
    if (event.status === "已发布") {
      Meteor.call('eventReadInc', FlowRouter.getParam('eid'));
    }
  }

  template.autorun(function() {
    var eid = FlowRouter.getParam('eid');
    // 订阅当前用户是否收藏过活动
    if (Meteor.userId()) {
      template.subscribe('userSavedEvent', Meteor.userId(), new Mongo.ObjectID(eid));
      template.subscribe('userJoinedEvent', eid, Meteor.userId());
    }
    // 订阅活动详情
    template.subscribe('eventDetailById', new Mongo.ObjectID(eid), function () {
      Tracker.afterFlush(function () {
        $(".event-sidebar").fadeTo("fast", 1);
        $(".mobile-join-wrap").fadeTo("fast", 1);
        //  将报名modal 里面的 Submit 修改为 报名
        template.$("#joinEvent button[type=submit]").hide();
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
  $(".fixed-bar-wrap").affix();

  // 如果是从预览按钮点击过来的，禁用 报名, 收藏和评论按钮。

  //  afterFlush  用来执行数据加载之后的回调。确保数据都加载完毕
  var template = this;
  template.autorun(function () {
    if (template.subscriptionsReady()) {
      Tracker.afterFlush(function () {
        var preview = FlowRouter.getQueryParam("preview");
        if (preview === "true") {
          $("#saveEvent").prop("disabled", true);
          $("#apply-event").prop("disabled", true);
          $("#submitComment").prop("disabled", true);
        } else {
          $("#saveEvent").prop("disabled", false);
          $("#apply-event").prop("disabled", false);
          $("#submitComment").prop("disabled", false);
        }
      });
    }
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
  "poster": function () {
    return this.poster;
  },
  "isPreview": function () {
    return Session.get("eventPosterData") ? true : false;
  },
  "previewPoster": function () {
    var poster = Session.get("eventPosterData");
    if (poster === 1) {
      return this.poster ? this.poster : "/images/default-poster.png";
    } else {
      return poster;
    }
  },
  "eventDetailDesc": function () {
    HTTP.get('http://7xnxwx.com1.z0.glb.clouddn.com/' + this.desc, function(err, res) {
      if(!err && res.statusCode === 200) {
        eventDesc.set(res.content);
      }
    });
    return eventDesc.get();
  },
  'hiddenPubBtn': function() {
    var event = Events.findOne({_id: new Mongo.ObjectID(FlowRouter.getParam("eid"))});
    if (event) {
      return event.status === '未发布' ? '': 'hidden';
    }
  },
  'optionSignFormTips': function() {
    return !!FlowRouter.getQueryParam('preview') ? '预览报名表单': '我要报名';
  },
  'eventTime': function () {
    var eventTime = {}, time = this.time;  // 取了with 中的时间，用于改写格式，此 helper 优先级高于 with
    if (time) {
      // 更改时间格式 ISO -> 2015年9月15日星期二下午5点37分
      eventTime.start = moment(time.start).format('M月D日 HH:mm');
      eventTime.end = moment(time.end).format('M月D日 HH:mm');
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
    return UserSavedEvents.findOne();
  },
  authJoinLogin: function() {
    return Meteor.userId();
  },
  // 判断当前用户是否已经报名
  'isJoined': function() {
    return JoinForm.findOne();
  },
  'joinStatus':function() {
    if(JoinForm.findOne()) {
      if(JoinForm.findOne().status === "禁止报名") {
        return "禁止报名";
      } else {
        return "已报名";
      }

    } else {
      return "我要报名";
    }
  },

  //  活动 id
  "eventId": function () {
    return FlowRouter.getParam("eid");
  },
  authManage: function() {
    if(Meteor.userId()) {
      var findEID = Events.findOne({'_id': new Mongo.ObjectID(FlowRouter.getParam('eid'))});
      if (!findEID) {
        return ;
      }
      var groupId = findEID.author.club.id;
      var membership = Memberships.findOne({userId: Meteor.userId(), groupId: groupId});
      if (!membership) {
        return ;
      }
      if(membership.role === "owner") {
        return true;
      } else if (Roles.userIsInRole(Meteor.userId(), ['create-event'], 'g'+ groupId)) {
        return true;
      } else {
        return false;
      }

    } else return false;
  }
});

Template.eventDetail.events({
  "click .my-join": function() {
    alert("请先登录！");
  },
  // 提交留言
  'click #submitComment': function(e) {
    e.preventDefault();
    if (!Meteor.user()) {
      alert('请先登录');
      return;
    }

    var eid = FlowRouter.getParam('eid');
    var commentContent = $('#commentContent').val();
    // 判断是否输入了字符。
    if (!commentContent.trim().length) {
      alert("请输入评论内容。");
    }
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
        $('#commentContent').val('');
      }
    });
  },
  // 左侧Tag跟随界面下滑滚动
  'click .event-sidebar-scroll': function (e) {
    var that = e.currentTarget;
    if (location.pathname.replace(/^\//, '') == that.pathname.replace(/^\//, '') && location.hostname == that.hostname) {
      var target = $(that.hash);
      target = target.length ? target : $('[name=' + that.hash.slice(1) + ']');
      if (target.length) {
        $('body, html').animate({
          scrollTop: target.offset().top - $(".event-home").offset().top
        }, 300);
      }
    }
    return false;
  },
  // 收藏活动
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
  },

  'click #publish-event': function(e) {
    if (!Meteor.userId()) {
      alert('请先登录！');
      return;
    }

    var target = e.currentTarget;

    $(target).attr("disabled", true).text("活动发布中...");

    EditEvent.eventPoster.setKey(Session.get("eventPosterData"));

    var eid = FlowRouter.getParam("eid");

    //  只是上传海报。
    Meteor.defer(function () {
      Meteor.call("updatePoster", new Mongo.ObjectID(eid), Session.get("eventPosterData"), function (err) {
        if (err) {
          console.log("upload poster faield in event detail page.");
        }
      });
    });

    var curEvent = Events.findOne({_id: new Mongo.ObjectID(eid)});
    var curEventGid = 0;
    var privateStatus = 0;
    if (!curEvent) {
      return ;
    } else {
      curEventGid = curEvent.author.club.id;
      privateStatus = curEvent.private;
    }
    Meteor.call('setEventStatus', new Mongo.ObjectID(eid), '已发布', curEventGid, privateStatus, function(err, res) {
      if (!err && res.code === 0) {
        // TODO:  这个地方需要修改，因为本来就在详情页面，没必要再go, 这个是暂时的方案。
        Session.set("eventPosterData", 0);
        FlowRouter.go("eventDetail", {eid: eid});
        FlowRouter.reload();
      }
    });
  },
  // 提交报名表单
  "click #apply-event": function (e, template) {
    if(!Meteor.userId()) {
      alert("请先登录！");
      return false;
    }
    template.$("#joinEvent").submit();
  }
});

Template.eventDetailAffixFooter.helpers({
  'hiddenPubBtn': function() {
    var event = Events.findOne({_id: new Mongo.ObjectID(FlowRouter.getParam("eid"))});
    if (event) {
      return event.status === '未发布' ? '': 'hidden';
    }
  }
});

Template.eventDetailAffixFooter.events({
  "click #publish-event-mobile": function (e) {
    e.preventDefault();
    if (!Meteor.userId()) {
      alert('请先登录！');
      return;
    }

    var target = e.currentTarget;

    $(target).attr("disabled", true).text("活动发布中...");

    EditEvent.eventPoster.setKey(Session.get("eventPosterData"));

    var eid = FlowRouter.getParam("eid");

    //  只是上传海报。
    Meteor.defer(function () {
      Meteor.call("updatePoster", new Mongo.ObjectID(eid), Session.get("eventPosterData"), function (err) {
        if (err) {
          console.log("upload poster faield in event detail page.");
        }
      });
    });

    var curEvent = Events.findOne({_id: new Mongo.ObjectID(eid)});
    var curEventGid = 0;
    var privateStatus = 0;
    if (!curEvent) {
      return ;
    } else {
      curEventGid = curEvent.author.club.id;
      privateStatus = curEvent.private;
    }
    Meteor.call('setEventStatus', new Mongo.ObjectID(eid), '已发布', curEventGid, privateStatus, function(err, res) {
      if (!err && res.code === 0) {
        // TODO:  这个地方需要修改，因为本来就在详情页面，没必要再go, 这个是暂时的方案。
        Session.set("eventPosterData", 0);
        FlowRouter.go("eventDetail", {eid: eid});
        FlowRouter.reload();
      }
    });
  }
});
