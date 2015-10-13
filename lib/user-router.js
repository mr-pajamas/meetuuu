/**
 * Created by Michael on 2015/10/6.
 */

// 个人用户页面路由。
FlowRouter.route("/user", {
  name: "user",
  action: function () {
    BlazeLayout.render("layoutCustomFooter", {main: "user", footer: "footerCustom"});
  }
});
