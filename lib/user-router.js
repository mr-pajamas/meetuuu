/**
 * Created by Michael on 2015/10/6.
 */

// 个人用户页面路由。


FlowRouter.route("/users/:userId/edit", {
  name: "userInfoEdit",
  action: function () {
    BlazeLayout.render("layout", {main: "userEdit", footer: "footerCustom"});
  }
});


FlowRouter.route("/users/:userId/:tab?", {
  name: "user",
  action: function () {
    BlazeLayout.render("layout", {main: "user", footer: "footerCustom"});
  }
});
