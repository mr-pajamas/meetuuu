/**
 * Created by Michael on 2015/9/28.
 */
FlowRouter.route("/group/home", {
  name: "groupHome",
  action: function () {
    BlazeLayout.render("layout", {main: "groupHome"});
  }
});
