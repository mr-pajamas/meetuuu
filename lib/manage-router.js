/**
 * Created by jianyanmin on 15/12/23.
 */
FlowRouter.route("/manage", {
  name: "manage",
  action: function () {
    //BlazeLayout.render("layout", {main: "manageLayout",mainLayout:"manageUserItem", footer: "footerBase"});
    BlazeLayout.render("manageLayout", {manageHeader:"manageHeader",mainlayout:"manageUserList"});
  }
});


FlowRouter.route("/adminLogin", {
  name: "adminLogin",
  action: function () {
    //BlazeLayout.render("layout", {main: "manageLayout",mainLayout:"manageUserItem", footer: "footerBase"});
    BlazeLayout.render("adminLogin");
  }
});
