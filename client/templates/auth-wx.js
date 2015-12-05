/**
 * Created by Michael on 2015/12/5.
 */
Template.authWx.onRendered(function () {
  Meteor.loginWithWeixin(FlowRouter.getQueryParam("code"), function (error, result) {
    if (error) {
      alert("微信授权失败：" + error.reason); // TODO: 使用fallback机制
    } else if (result) {
      Session.set("wxUserId", result);
    }

    FlowRouter.go(FlowRouter.getQueryParam("redirectPath"));
  });
});
