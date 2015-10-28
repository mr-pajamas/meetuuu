/**
 * Created by Michael on 2015/10/5.
 */
Template.authSignin.events({
  "submit": function (event, template) {
    event.preventDefault();

    if (Meteor.user()) Meteor.logout();

    var mobile = template.$("[name=mobile]").val();
    var password = template.$("[name=password]").val();

    var options = {
      mobile: mobile,
      password: password
    };

    Meteor.commonLogin(options, function (error) {
      if (error) {
        alert(error.reason);
      } else {
        FlowRouter.go("index");
      }
    });
  }
});
