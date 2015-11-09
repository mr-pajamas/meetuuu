/**
 * Created by Michael on 2015/11/9.
 */
Template.authJoinInsecure.events({
  "submit": function (event, template) {
    event.preventDefault();

    if (Meteor.user()) Meteor.logout();

    var name = template.$("[name=name]").val();
    var mobile = template.$("[name=mobile]").val();
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
