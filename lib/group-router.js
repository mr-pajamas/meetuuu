/**
 * Created by Michael on 2015/9/28.
 */
FlowRouter.route("/group/home", {
  name: "groupHomeTest",
  action: function () {
    BlazeLayout.render("groupLayout", {main: "groupHome"});
  }
});

FlowRouter.route("/group/:groupPath", {
  name: "groupHome",
  action: function () {
    BlazeLayout.render("groupLayout", {main: "groupHome"});
  }
});
