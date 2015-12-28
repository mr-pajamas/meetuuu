/**
 * Created by jianyanmin on 15/12/23.
 */
FlowRouter.route("/manage", {
  name: "manage",
  action: function () {
    BlazeLayout.render("layout", {main: "test", footer: "footerBase"});
  }
});
