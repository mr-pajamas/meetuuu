/**
 * Created by Michael on 2015/10/26.
 */
Template.authModal.onCreated(function () {
  this.signinOrJoin = new ReactiveVar(true);
});

Template.authModal.helpers({
  "signinOrJoin": function () {
    return Template.instance().signinOrJoin.get();
  },
  verifyDisabled: function () {
    return (!!Meteor.verificationAvailCountdown() && "disabled") || null;
  },
  countingDown: function () {
    return Meteor.verificationAvailCountdown();
  }
});

Template.authModal.events({
  "click .modal-footer > button:nth-child(2)": function (event, template) {
    Tracker.afterFlush(function () {
      template.$(".auth-modal").modal("handleUpdate");
    });
    template.signinOrJoin.set(!template.signinOrJoin.get());
  },
  "click .modal-footer > button.btn-primary": function (event, template) {
    if (template.signinOrJoin.get()) template.$(".auth-modal-signin-form").submit();
    else template.$(".auth-modal-join-form").submit();
  },
  "click [name=code] + div > button": function (event, template) {
    var mobile = template.$(".auth-modal-join-form [name=mobile]").val();
    if (!Match.test(mobile, Pattern.Mobile)) {
      alert("请正确填写手机号");
      return;
    }
    Meteor.requestVerificationMessage(mobile, function (error) {
      if (error) alert(error.reason);
    });
  },
  "submit .auth-modal-signin-form": function (event, template) {
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
        template.$(".auth-modal").on("hidden.bs.modal", notifyLogin).modal("hide");
      }
    });
  },
  "submit .auth-modal-join-form": function (event, template) {
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
        template.$(".auth-modal").on("hidden.bs.modal", notifyLogin).modal("hide");
      }
    });
  }
});

function notifyLogin() {
  $(this).off("hidden.bs.modal", notifyLogin).trigger("login.muuu");
}
