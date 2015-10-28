/**
 * Created by Michael on 2015/10/5.
 */
Template.authJoin.onCreated(function () {

});

Template.authJoin.onRendered(function () {

});

Template.authJoin.helpers({
  verifyDisabled: function () {
    return (!!Meteor.verificationAvailCountdown() && "disabled") || null;
  },
  countingDown: function () {
    return Meteor.verificationAvailCountdown();
  }
});

Template.authJoin.events({
  "click button[type=button]": function (event, template) {
    var mobile = template.$("[name=mobile]").val();
    if (!Match.test(mobile, Pattern.Mobile)) {
      alert("请正确填写手机号");
      return;
    }
    Meteor.requestVerificationMessage(mobile, function (error) {
      if (error) alert(error.reason);
    });
  },
  "submit": function (event, template) {
    event.preventDefault();

    if (Meteor.user()) Meteor.logout();

    var name = template.$("[name=name]").val();
    var mobile = template.$("[name=mobile]").val();
    var code = template.$("[name=code]").val();
    var password = template.$("[name=password]").val();
    var confirm = template.$("[name=confirm]").val();

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
        FlowRouter.go("index");
      }
    });
  }
});
