/**
 * Created by Michael on 2015/10/5.
 */
Template.authJoin.events({
  "submit": function (event, template) {
    event.preventDefault();

    var name = template.$("[name=name]").val();
    var mobile = template.$("[name=mobile]").val();
    var password = template.$("[name=password]").val();

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
