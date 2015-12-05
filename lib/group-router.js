/**
 * Created by Michael on 2015/9/28.
 */
FlowRouter.route("/create-group", {
  name: "createGroup",
  action: function () {
    BlazeLayout.render("layout", {main: "groupCreate", footer: "footerBase"});
  }
});

FlowRouter.route("/groups", {
  name: "groupList",
  action: function () {
    BlazeLayout.render("layout", {main: "index", footer: "footer"});
  }
});

var groupRoutes = FlowRouter.group({
  prefix: "/groups",
  name: "groups"
});

/*
groupRoutes.route("/", {
  name: "groupList",
  action: function () {
    BlazeLayout.render("layout", {main: "index", footer: "footer"});
  }
});
*/

groupRoutes.route("/:groupPath", {
  name: "groupHome",
  action: function () {
    BlazeLayout.render("layout", {content: "groupLayout", main: "groupHome"});
  }
});

var groupMemberRoutes = groupRoutes.group({
  prefix: "/:groupPath/members",
  name: "groupMembers"
});

groupMemberRoutes.route("/", {
  name: "groupMemberList",
  action: function () {
    BlazeLayout.render("layout", {content: "groupLayout", main: "groupMemberList"});
  }
});

groupMemberRoutes.route("/:memberId", {
  name: "groupMember",
  action: function () {
    BlazeLayout.render("layout", {content: "groupLayout", main: "groupMember"});
  }
});

groupRoutes.route("/:groupPath/events", {
  name: "groupEventList",
  action: function () {
    BlazeLayout.render("layout", {content: "groupLayout", main: "groupEventList"});
  }
});

var groupSettingRoutes = groupRoutes.group({
  prefix: "/:groupPath/settings",
  name: "groupSettings"
});

groupSettingRoutes.route("/basic", {
  name: "groupSettingBasic",
  action: function () {
    BlazeLayout.render("layout", {content: "groupLayout", main: "groupSettings", footer: "footerBase"});
  }
});

groupSettingRoutes.route("/roles", {
  name: "groupSettingRoleList",
  action: function () {
    BlazeLayout.render("layout", {content: "groupLayout", main: "groupSettings", footer: "footerBase"});
  }
});

groupSettingRoutes.route("/roles/:roleId", {
  name: "groupSettingRole",
  action: function () {
    BlazeLayout.render("layout", {content: "groupLayout", main: "groupSettings", footer: "footerBase"});
  }
});

groupSettingRoutes.route("/privacy", {
  name: "groupSettingPrivacy",
  action: function () {
    BlazeLayout.render("layout", {content: "groupLayout", main: "groupSettings", footer: "footerBase"});
  }
});
