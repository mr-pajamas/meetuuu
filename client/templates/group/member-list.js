/**
 * Created by Michael on 2015/11/1.
 */
/*
Meteor._ensure(Meteor, "postLoginActions");
Meteor.postLoginActions.showMemberListJoinModal = function (options) {
  if (!Memberships.findOne({groupId: options.groupId, userId: Meteor.userId(), status: {$in: [MemberStatus.Joined, MemberStatus.Banned]}})) {
    $(".group-member-list-modal").modal();
  } else {
    alert("你已经在俱乐部里了");
  }
};
*/

Template.groupMemberList.onCreated(function () {
  var template = this;

  //template.searchString = new ReactiveVar();

  template.autorun(function () {
    var group = Template.currentData();
    //var routeName = FlowRouter.getRouteName();

    var status = FlowRouter.getQueryParam("status");

    //var searchString = template.$(".group-member-list-main input[name=searchString]").val();
    var searchString = FlowRouter.getQueryParam("q");

    var selector = {
      status: (status == "applying" ? MemberStatus.Applying : MemberStatus.Joined)
    };
    if (searchString) selector.nickname = {$regex: searchString, $options: "i"};

    template.searchHandle = template.subscribe("groupMembers", group._id, selector);
  });
});

Template.groupMemberList.onRendered(function () {
  var template = this;

  /*
  Meteor.postLoginActions.showMemberListJoinModal = function () {
    if (!Memberships.findOne({groupId: template.data._id, userId: Meteor.userId(), status: {$in: [MemberStatus.Joined, MemberStatus.Banned]}})) {
      template.$(".group-member-list-modal").modal();
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
        template.$(".group-member-list-modal").modal();
      } else {
        alert("你已经在俱乐部里了");
      }
    }
  });
});

Template.groupMemberList.helpers({

  canJoin: function () {
    return !Memberships.findOne({groupId: this._id, userId: Meteor.userId(), status: {$in: [MemberStatus.Joined, MemberStatus.Banned]}});
  },

  memberList: function () {
    var group = this;
    //var routeName = FlowRouter.getRouteName();
    var status = FlowRouter.getQueryParam("status");
    var searchString = FlowRouter.getQueryParam("q");
    var selector = {
      groupId: group._id,
      status: (status == "applying" ? MemberStatus.Applying : MemberStatus.Joined)
    };
    if (searchString) selector.nickname = {$regex: searchString, $options: "i"};

    return Memberships.find(selector, {sort: {statusUpdatedAt: 1}});
  },

  membersOrApplicants: function () {
    var status = FlowRouter.getQueryParam("status");
    return !status || status === "joined";
  },

  searchOption: function () {
    return FlowRouter.getQueryParam("status") === "applying" ? "申请人" : "找成员";
  },

  resultSetReady: function () {
    return Template.instance().searchHandle.ready();
  },

  user: function () {
    return Meteor.users.findOne(this.userId);
  },

  roleName: function () {
    return Template.parentData().roles[this.role].name;
  }
});

Template.groupMemberList.events({
  "click .page-header > button": function (event, template) {
    if (!Meteor.user()) {
      //template.$(".auth-modal").modal();
      Session.setPersistent("postponedAction", {name: "showJoinModal"});

      Meteor.showLoginModal(true);
    } else {
      template.$(".group-member-list-modal").modal();
    }
  },
  /*
   "login.muuu .auth-modal": function (event, template) {
   if (!Memberships.findOne({groupId: template.data._id, userId: Meteor.userId(), status: {$in: [MemberStatus.Joined, MemberStatus.Banned]}})) {
   template.$(".group-member-list-modal").modal();
   } else {
   alert("你已经在俱乐部里了");
   }
   },
   */
  "click .group-member-list-modal .modal-footer > button.btn-primary": function(event, template) {
    if (Meteor.user()) {
      template.$(".group-member-list-modal form").submit();
    } else {
      template.$(".group-member-list-modal").modal("hide");
    }
  },
  "submit .group-member-list-modal form": function (event, template) {
    event.preventDefault();

    var $target = $(event.currentTarget);
    var $imgUpload = $target.find(".img-upload");
    var $gender = $target.find("[name=gender]:checked");
    var $btnPrimary = template.$(".group-member-list-modal .modal-footer > .btn.btn-primary");

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
    var options = {
      groupId: group._id,
      bio: bio
    };

    Meteor.call("applyMembership", options, function (error, result) {
      $btnPrimary.text("申请入会").prop("disabled", false);
      if (error) {
        alert(error.reason);
      } else {
        template.$(".group-member-list-modal").on("hidden.bs.modal", function () {
          //FlowRouter.go("groupApplicantList", {groupPath: group.path});
          FlowRouter.setQueryParams({status: "applying"});
        }).modal("hide");
      }
    });
  },

  "change .group-member-list-main form select": function (event, template) {
    var group = template.data;
    var query = {};
    if (FlowRouter.getQueryParam("q")) query.q = FlowRouter.getQueryParam("q");

    var selectValue = $(event.currentTarget).val();
    if ("找成员" === selectValue) {
      //FlowRouter.go("groupMemberList", {groupPath: group.path}, query);
      FlowRouter.setQueryParams({status: null});
    } else {
      //FlowRouter.go("groupApplicantList", {groupPath: group.path}, query);
      FlowRouter.setQueryParams({status: "applying"});
    }
  },

  "input .group-member-list-main form input[name=searchString]": _.debounce(triggerSearch, 500),

  "submit .group-member-list-main form": function (event, template) {
    event.preventDefault();
    triggerSearch(event, template);
  },

  "click .group-applicant-btn-group > button:first-child": function (event, template) {
    var options = {
      //groupId: template.data._id,
      membershipId: this._id
    };

    Meteor.call("approveMembership", options, function (error, result) {
      if (error) {
        alert(error.reason);
      }
    });
  },
  "click .group-applicant-btn-group > button:last-child": function (event, template) {
    var options = {
      //groupId: template.data._id,
      membershipId: this._id,
      disapprove: true
    };

    Meteor.call("approveMembership", options, function (error, result) {
      if (error) {
        alert(error.reason);
      }
    });
  }
});

function triggerSearch(event, template) {
  var q = $.trim(template.$(".group-member-list-main form input[name=searchString]").val()) || null;
  FlowRouter.setQueryParams({q: q});
}
