/**
 * Created by Michael on 2015/9/28.
 */
FlowRouter.route("/create-group", {
  name: "createGroup",
  action: function () {
    BlazeLayout.render("layoutCustomFooter", {main: "groupCreate", footer: "footerBase"});
  }
});

var groupRoutes = FlowRouter.group({
  prefix: "/groups",
  name: "group"
});

groupRoutes.route("/:groupPath", {
  name: "groupHome",
  action: function () {
    BlazeLayout.render("groupLayout", {main: "groupHome"});
  }
});

groupRoutes.route("/home", {
  name: "groupHomeTest",
  action: function () {
    BlazeLayout.render("groupLayout", {main: "groupHome"});
  }
});
