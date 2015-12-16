/**
 * Created by Michael on 2015/10/26.
 */
//var POST_LOGIN_ACTION = "postLoginAction";

Template.authModals.onCreated(function () {
  this.signinOrJoin = new ReactiveVar(true);
});

Template.authModals.onRendered(function () {
  var template = this;
  /*
   Meteor.showLoginModal = function (postActionName, options) {
   if (postActionName) {
   var action = {actionName: postActionName};
   if (options) action.options = options;
   //Session.setPersistent(POST_LOGIN_ACTION, action);
   } else {
   //Session.clear(POST_LOGIN_ACTION);
   }
   template.$(".auth-modal").modal();
   };
   */

  Meteor.showLoginModal = function (keepPostponedAction) {
    if (!keepPostponedAction) Session.clear("postponedAction");
    // TODO: 清表单
    template.$(".auth-modal").modal();
  };
});

Template.authModals.helpers({
  "signinOrJoin": function () {
    return Template.instance().signinOrJoin.get();
  }
});

Template.authModals.events({
  "click .auth-modal .modal-footer > button:nth-child(2)": function (event, template) {
    Tracker.afterFlush(function () {
      template.$(".auth-modal").modal("handleUpdate");
    });
    template.signinOrJoin.set(!template.signinOrJoin.get());
  },
  "click .modal-footer > button.btn-primary": function (event) {
    var $target = $(event.currentTarget);
    $target.parents(".modal").find("form").submit();
  }
});

/*
 function execPostAction() {
 $(this).off("hidden.bs.modal", execPostAction);
 //var action = Session.get(POST_LOGIN_ACTION);
 if (action && Meteor.postLoginActions && Meteor.postLoginActions[action.actionName]) {
 Meteor.postLoginActions[action.actionName](action.options);
 }
 }
 */

/*
 Meteor._execPostLoginAction = function () {
 //var action = Session.get(POST_LOGIN_ACTION);
 if (action && Meteor.postLoginActions && Meteor.postLoginActions[action.actionName]) {
 Meteor.postLoginActions[action.actionName](action.options);
 }
 };
 */
/*
Template.authModalSigninContent.helpers({
  wxOauthLink: function () {
    FlowRouter.watchPathChange();
    var currentContext = FlowRouter.current();

    return Meteor.wxOauthLink({
      appid: WX_PUBLIC_APP_ID,
      redirect_uri: FlowRouter.url("wxOauth", {}, {redirectPath: currentContext.path}),
      response_type: "code",
      scope: "snsapi_userinfo"
    });
  },
  wxHrefAttr: function () {
    FlowRouter.watchPathChange();
    var currentContext = FlowRouter.current();

    return {
      href: Meteor.wxOauthLink({
        appid: WX_PUBLIC_APP_ID,
        redirect_uri: FlowRouter.url("wxOauth", {}, {redirectPath: currentContext.path}),
        response_type: "code",
        scope: "snsapi_userinfo"
      })
    };
  }
});
*/

Template.authModalSigninContent.helpers({
  weixinLogin: function () {
    return Meteor.isWeixin || !Meteor.isMobile;
  }
});

Template.authModalSigninContent.events({
  "click .form-group:first-child .btn": function () {
    if (Meteor.isWeixin) {
      window.location.replace(Meteor.wxOauthLink(WxPlatform.public));
    } else {
      window.location.replace(Meteor.wxOauthLink(WxPlatform.open));
    }
  },
  "submit form": function (event, template) {
    event.preventDefault();

    var $target = $(event.currentTarget);

    var mobile = $target.find("[name=mobile]").val();
    var password = $target.find("[name=password]").val();

    if (!Match.test(mobile, Pattern.Mobile)) {
      alert("请正确填写手机号");
      return;
    }

    if (!Match.test(password, Pattern.NonEmptyString)) {
      alert("请填写密码");
      return;
    }

    var options = {
      mobile: mobile,
      password: password
    };

    Meteor.commonLogin(options, function (error) {
      if (error) {
        alert(error.reason);
      } else {
        //$target.parents(".modal").on("hidden.bs.modal", execPostAction).modal("hide");
        $target.parents(".modal").modal("hide");
      }
    });
  }
});

Template.authModalJoinContent.helpers({
  verifyDisabled: function () {
    return (!!Meteor.verificationAvailCountdown() && "disabled") || null;
  },
  countingDown: function () {
    return Meteor.verificationAvailCountdown();
  }
});

Template.authModalJoinContent.events({
  "click [name=code] + div > button": function (event, template) {
    var mobile = template.$("[name=mobile]").val();
    if (!Match.test(mobile, Pattern.Mobile)) {
      alert("请正确填写手机号");
      return;
    }
    Meteor.requestVerificationMessage(mobile, function (error) {
      if (error) alert(error.reason);
    });
  },
  "submit form": function (event, template) {
    event.preventDefault();

    var $target = $(event.currentTarget);

    var name = $target.find("[name=name]").val();
    var mobile = $target.find("[name=mobile]").val();
    var code = $target.find("[name=code]").val();
    var password = $target.find("[name=password]").val();
    var confirm = $target.find("[name=confirm]").val();

    if (!Match.test(name, Pattern.NonEmptyString)) {
      alert("请填写姓名");
      return;
    }

    if (!Match.test(mobile, Pattern.Mobile)) {
      alert("请正确填写手机号");
      return;
    }

    if (Meteor.verifyMobile(mobile, code)) {
      alert("请验证您的手机");
      return;
    }

    if (password !== confirm) {
      alert("两次密码输入不一致");
      return;
    }

    var options = {
      mobile: mobile,
      password: password,
      profile: {
        name: name
      }
    };

    Accounts.newUser(options, function (error) {
      if (error) {
        alert(error.reason);
      } else {
        //$target.parents(".modal").on("hidden.bs.modal", execPostAction).modal("hide");
        $target.parents(".modal").modal("hide");
      }
    });
  }
});

Template.authBindModal.onRendered(function () {
  var template = this;
  /*
   Meteor.showBindModal = function (wxUserId) {
   template.wxUserId = wxUserId;
   template.$(".auth-bind-modal").modal();
   };
   */

  template.autorun(function () {
    var wxUserId = Session.get("wxUserId");
    if (wxUserId && !Session.get("windowOccupied")) {
      Session.clear("wxUserId");

      template.wxUserId = wxUserId;
      template.$(".auth-bind-modal").modal();
    }
  });
});

Template.authBindModal.helpers({
  verifyDisabled: function () {
    return (!!Meteor.verificationAvailCountdown() && "disabled") || null;
  },
  countingDown: function () {
    return Meteor.verificationAvailCountdown();
  }
});

Template.authBindModal.events({
  "click [name=code] + div > button": function (event, template) {
    var mobile = template.$("[name=mobile]").val();
    if (!Match.test(mobile, Pattern.Mobile)) {
      alert("请正确填写手机号");
      return;
    }
    Meteor.requestVerificationMessage(mobile, function (error) {
      if (error) alert(error.reason);
    });
  },
  "submit form": function (event, template) {
    event.preventDefault();

    var $target = $(event.currentTarget);

    var mobile = $target.find("[name=mobile]").val();
    var code = $target.find("[name=code]").val();

    if (!Match.test(mobile, Pattern.Mobile)) {
      alert("请正确填写手机号");
      return;
    }

    if (Meteor.verifyMobile(mobile, code)) {
      alert("请验证您的手机");
      return;
    }

    var options = {
      mobile: mobile,
      wxUserId: template.wxUserId
    };

    Accounts.newWxUser(options, function (error) {
      if (error) {
        alert(error.reason);
      } else {
        //$target.parents(".modal").on("hidden.bs.modal", execPostAction).modal("hide");
        $target.parents(".modal").modal("hide");
      }
    });
  }
});
