/**
 * Created by Michael on 2015/9/24.
 */
FlowRouter.route("/test-scrollspy", {
  name: "testScrollSpy",
  action: function () {
    BlazeLayout.render("layout", {main: "testScrollSpy"});
  }
});

FlowRouter.route("/test", {
  name: "test",
  action: function () {
    BlazeLayout.render("test");
  }
});

FlowRouter.route("/test-affix", {
  name: "testAffix",
  action: function () {
    BlazeLayout.render("layout", {main: "testAffix", footer: "testAffixFooter"});
  }
});

FlowRouter.route("/test-loading", {
  name: "testLoading",
  action: function () {
    BlazeLayout.render("loading");
  }
});
