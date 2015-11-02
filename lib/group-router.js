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
  name: "groups"
});

groupRoutes.route("/:groupPath", {
  name: "groupHome",
  action: function () {
    BlazeLayout.render("groupLayout", {main: "groupHome"});
  }
});

var groupMemberRoutes = groupRoutes.group({
  prefix: "/:groupPath/members",
  name: "groupMembers"
});

groupMemberRoutes.route("/", {
  name: "groupMemberList",
  action: function () {
    BlazeLayout.render("groupLayout", {main: "groupMemberList"});
  }
});

groupMemberRoutes.route("/:memberId", {
  name: "groupMember",
  action: function () {

  }
});

groupRoutes.route("/:groupPath/events", {
  name: "groupEventList",
  action: function () {
    BlazeLayout.render("groupLayout", {main: "groupEventList"});
  }
});

