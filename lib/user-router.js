/**
 * Created by Michael on 2015/10/6.
 */

// 个人用户页面路由。
FlowRouter.route("/user/:uid", {
  name: "user",
  action: function () {
    BlazeLayout.render("layoutCustomFooter", {main: "user", footer: "footerCustom"});
  }
});

FlowRouter.route("/user/edit/:userId", {
  name: "userInfoEdit",
  action: function () {
    BlazeLayout.render("layoutCustomFooter", {main: "userEdit", footer: "footerCustom"});
  }
});
