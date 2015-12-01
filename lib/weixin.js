/**
 * Created by Michael on 2015/11/27.
 */
WX_APP_ID = "wxd733d4919562ba78";

var linkFormat = _.template("https://open.weixin.qq.com/connect/oauth2/authorize?<%= queryParams %>#wechat_redirect");

if (Meteor.isServer) {
}

if (Meteor.isClient) {
  Meteor.isWeixin = navigator.userAgent.toLowerCase().indexOf("micromessenger") !== -1;

  var skipAutoSignin = !Meteor.isWeixin;

  FlowRouter.triggers.enter([function (context, redirect, stop) {

    if (!skipAutoSignin) {

      Tracker.autorun(function (c) {
        if (!Meteor.loggingIn()) {
          c.stop();
          if (Meteor.user()) {
            skipAutoSignin = true;
            FlowRouter.reload();
          } else {

            var params = $.param({
              appid: WX_APP_ID,
              redirect_uri: FlowRouter.url("wxOauth", {}, {redirectPath: context.path}),
              response_type: "code",
              scope: "snsapi_base"
            });

            window.location.replace(linkFormat({queryParams: params}));
          }
        }
      });

      stop();
    }
  }], {except: ["wxOauth"]});

  FlowRouter.route("/wx-oauth", {
    name: "wxOauth",
    triggersEnter: [function (context, redirect) {
      skipAutoSignin = true;

      // TODO: signin
      alert(context.queryParams.code);

      redirect(context.queryParams.redirectPath);
    }]
  });
}
