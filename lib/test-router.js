/**
 * Created by Michael on 2015/9/24.
 */
FlowRouter.route("/test-affix", {
  name: "testAffix",
  action: function () {
    BlazeLayout.render("layoutCustomFooter", {main: "testAffix", footer: "testAffixFooter"});
  }
});
