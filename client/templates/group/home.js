/**
 * Created by Michael on 2015/10/26.
 */
/*
Meteor._ensure(Meteor, "postLoginActions");
Meteor.postLoginActions.showHomeJoinModal = function (options) {
  if (!Memberships.findOne({groupId: options.groupId, userId: Meteor.userId(), status: {$in: [MemberStatus.Joined, MemberStatus.Banned]}})) {
    $(".group-home-join-modal").modal();
  } else {
    alert("你已经在俱乐部里了");
  }
};
*/

Template.groupHome.onCreated(function () {
  var template = this;

  template.now = new ReactiveVar(new Date());
  template.today = new ReactiveVar(template.now.get());

  (function daily() {
    var today = moment(template.today.get());
    var startOfTomorrow = moment(today).add(1, "d").startOf("day");

    template.dayShiftTid = Meteor.setTimeout(function () {
      //template.dayShiftTid = undefined;
      template.now.set(new Date());
      template.today.set(template.now.get());
      daily();
    }, startOfTomorrow.diff(today));
  }());

  template.autorun(function () {
    var group = Template.currentData();

    template.groupOwnerHandle = template.subscribe("groupMembers", group._id, {role: "owner"});

    Tracker.autorun(function () {
      var today = moment(template.today.get());
      var start = moment(today).subtract(1, "d").startOf("day").toDate();
      var end = moment(today).add(1, "d").endOf("day").toDate();

      template.groupTimelineHandle = template.subscribe("groupTimeline", group._id, start, end);
    });
  });

  template.autorun(function () {
    template.timeShiftTid && (Meteor.clearTimeout(template.timeShiftTid), template.timeShiftTid = undefined);

    template.now.get();
    var now = moment();
    var endOfToday = moment(now).endOf("day").toDate();
    var upcoming = GroupTimelineItems.findOne({datetime: {$gt: now.toDate(), $lte: endOfToday}}, {sort: {datetime: 1}});
    if (upcoming) {
      template.timeShiftTid = Meteor.setTimeout(function () {
        template.timeShiftTid = undefined;
        template.now.set(new Date());
      }, moment(upcoming.datetime).diff(now));
    }
  });
});

Template.groupHome.onRendered(function () {
  var template = this;

  /*
  Meteor.postLoginActions.showHomeJoinModal = function () {
    if (!Memberships.findOne({groupId: template.data._id, userId: Meteor.userId(), status: {$in: [MemberStatus.Joined, MemberStatus.Banned]}})) {
      template.$(".group-home-join-modal").modal();
    } else {
      alert("你已经在俱乐部里了");
    }
  };
  */
  template.autorun(function () {
    var postponedAction = Session.get("postponedAction");
    if (Meteor.user() && !Session.get("windowOccupied") && postponedAction && postponedAction.name === "showJoinModal") {
      Session.clear("postponedAction");

      if (!Memberships.findOne({groupId: template.data._id, userId: Meteor.userId(), status: {$in: [MemberStatus.Joined, MemberStatus.Banned]}})) {
        template.$(".group-home-join-modal").modal();
      } else {
        alert("你已经在俱乐部里了");
      }
    }
  });
});

Template.groupHome.helpers({
  canJoin: function () {
    return !Memberships.findOne({groupId: this._id, userId: Meteor.userId(), status: {$in: [MemberStatus.Joined, MemberStatus.Banned]}});
  },

  foundedDate: function () {
    return moment(this.foundedDate).format("ll");
  },
  owner: function () {
    if (Template.instance().groupOwnerHandle.ready()) {
      return Memberships.findOne({groupId: this._id, role: "owner"});
    }
  },
  ownerUser: function () {
    return Meteor.users.findOne(this.userId);
  },
  roleName: function () {
    var group = Template.parentData();
    var role = this.role || group.defaultRole;
    return group.roles[role].name;
  },
  tomorrowTimelineItems: function () {
    var now = moment(Template.instance().now.get());
    var start = moment(now).add(1, "d").startOf("day").toDate();
    var end = moment(now).add(1, "d").endOf("day").toDate();
    return GroupTimelineItems.find({datetime: {$gte: start, $lte: end}}, {sort: {datetime: -1}});
  },
  todayFutureTimelineItems: function () {
    var now = moment(Template.instance().now.get());
    var startExclusive = moment(now).toDate();
    var end = moment(now).endOf("day").toDate();
    return GroupTimelineItems.find({datetime: {$gt: startExclusive, $lte: end}}, {sort: {datetime: -1}});
  },
  todayPastTimelineItems: function () {
    var now = moment(Template.instance().now.get());
    var start = moment(now).startOf("day").toDate();
    var end = moment(now).toDate();
    return GroupTimelineItems.find({datetime: {$gte: start, $lte: end}}, {sort: {datetime: -1}});
  },
  yesterdayTimelineItems: function () {
    var now = moment(Template.instance().now.get());
    var start = moment(now).subtract(1, "d").startOf("day").toDate();
    var end = moment(now).subtract(1, "d").endOf("day").toDate();
    return GroupTimelineItems.find({datetime: {$gte: start, $lte: end}}, {sort: {datetime: -1}});
  }
});

Template.groupHome.events({
  "click .group-description button.btn-success": function (event, template) {
    if (!Meteor.user()) {
      Session.setPersistent("postponedAction", {name: "showJoinModal"});

      Meteor.showLoginModal(true);
      //template.$(".auth-modal").modal();
    } else {
      template.$(".group-home-join-modal").modal();
    }
  },
  /*
   "login.muuu .auth-modal": function (event, template) {
   if (!Memberships.findOne({groupId: template.data._id, userId: Meteor.userId(), status: {$in: [MemberStatus.Joined, MemberStatus.Banned]}})) {
   template.$(".group-home-join-modal").modal();
   } else {
   alert("你已经在俱乐部里了");
   }
   },
   */
  "click .group-home-join-modal .modal-footer > button.btn-primary": function(event, template) {
    if (Meteor.user()) {
      template.$(".group-home-join-modal form").submit();
    } else {
      template.$(".group-home-join-modal").modal("hide");
    }
  },
  "submit .group-home-join-modal form": function (event, template) {
    event.preventDefault();

    var $target = $(event.currentTarget);
    var $imgUpload = $target.find(".img-upload");
    var $gender = $target.find("[name=gender]:checked");
    var $btnPrimary = template.$(".group-home-join-modal .modal-footer > .btn.btn-primary");

    var croppedImg = $imgUpload.length && $imgUpload.imgUpload("crop");
    var gender = $gender.val();
    var bio = $target.find("[name=bio]").val();

    if ($imgUpload.length && !croppedImg) {
      alert("请上传头像");
      return;
    }

    if (!Match.test(bio, Pattern.NonEmptyString)) {
      alert("请填写自我介绍");
      return;
    }


    $btnPrimary.text("提交中...").prop("disabled", true);

    if (croppedImg) {
      Meteor.defer(function () {
        Meteor.call("uploadAvatar", croppedImg);
      });
    }

    if (gender) {
      Meteor.users.update(Meteor.userId(), {$set: {"profile.gender": gender}});
    }

    var group = template.data;
    var applyOptions = {
      groupId: group._id,
      bio: bio
    };

    Meteor.call("applyMembership", applyOptions, function (error, result) {
      $btnPrimary.text("申请入会").prop("disabled", false);
      if (error) {
        alert(error.reason);
      } else {
        template.$(".group-home-join-modal").modal("hide");
      }
    });
  }
});

Template.groupHome.onDestroyed(function () {
  this.timeShiftTid && Meteor.clearTimeout(this.timeShiftTid);
  this.dayShiftTid && Meteor.clearTimeout(this.dayShiftTid);
});

Template.timelineItem.helpers({
  timelineItemData: function () {
    var group = Template.parentData();
    var user = Meteor.users.findOne(this.userId);
    var membership = Memberships.findOne({groupId: this.groupId, userId: this.userId});

    return {groupTimelineItem: this, group: group, user: user, membership: membership};
  }
});
