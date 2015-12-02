/**
 * Created by Michael on 2015/11/27.
 */
WX_APP_ID = "wxd733d4919562ba78";

var linkFormat = _.template("https://open.weixin.qq.com/connect/oauth2/authorize?<%= queryParams %>#wechat_redirect");

WxUsers = new Mongo.Collection("wx-users");

WxUsers.attachSchema(new SimpleSchema({
  userId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
    denyUpdate: true
  },
  openid: {
    type: String,
    denyUpdate: true,
    index: true,
    unique: true
  },
  unionid: {
    type: String,
    optional: true,
    index: true,
    unique: true,
    sparse: true
  },
  nickname: {
    type: String
  },
  sex: {
    type: Number,
    allowedValues: [1, 2, 0]
  },
  province: {
    type: String,
    optional: true
  },
  city: {
    type: String,
    optional: true
  },
  country: {
    type: String,
    optional: true
  },
  headimgurl: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true
  }
}));

if (Meteor.isServer) {

  WxOauth = function (code) {

    var accessToken;
    var wxUser;

    function getAccessToken() {

      var resultContent = HTTP.get("https://api.weixin.qq.com/sns/oauth2/access_token?grant_type=authorization_code", {
        params: {
          appid: WX_APP_ID,
          secret: WX_APP_SECRET,
          code: code
        }
      }).content;

      var resultData = JSON.parse(resultContent);

      if (resultData.access_token) {
        var scope = resultData.scope;

        wxUser = {
          openid: resultData.openid
        };

        if (resultData.unionid) wxUser.unionid = resultData.unionid;

        if (scope === "snsapi_userinfo") accessToken = resultData.access_token;
      } else {
        throw new Error(resultData.errmsg);
      }
    }

    function getInfo() {

      var resultContent = HTTP.get("https://api.weixin.qq.com/sns/userinfo?lang=zh_CN", {
        params: {
          access_token: accessToken,
          openid: wxUser.openid
        }
      }).content;

      var resultData = JSON.parse(resultContent);

      if (resultData.openid) {
        _.extend(wxUser, _.pick(resultData, "nickname", "sex", "province", "city", "country", "headimgurl"));
      } else {
        throw new Error(resultData.errmsg);
      }
    }

    function persist() {

      var persisted = WxUsers.findOne({openid: wxUser.openid});

      if (persisted) {
        WxUsers.update(persisted._id, _.omit(wxUser, "openid"));
        wxUser = _.extend(persisted, wxUser);
      } else {
        wxUser._id = WxUsers.insert(wxUser);
      }
    }

    getAccessToken();
    if (accessToken) {
      try {
        getInfo();
      } catch (e) {
        console.log(e);
      }
    }

    persist();

    this.wxUser = wxUser;
  };

  Meteor.methods({
    wxLogin: function (options) {
      return Accounts._loginMethod(this, "wxLogin", arguments, "wxOauth", function () {
        check(options.code, String);

        var wxUser;

        try {
          wxUser = new WxOauth(options.code).wxUser;
        } catch (e) {
          return {error: new Meteor.Error(500, e.message)};
        }

        if (wxUser.userId) {
          return {userId: wxUser.userId};
        } else {
          return {error: new Meteor.Error(100, wxUser._id)};
        }
      });
    }
  });
}

if (Meteor.isClient) {
  Meteor.isWeixin = navigator.userAgent.toLowerCase().indexOf("micromessenger") !== -1;

  Meteor.loginWithWeixin = function (code, callback) {
    check(code, String);

    Accounts.callLoginMethod({
      methodName: "wxLogin",
      methodArguments: [{code: code}],
      userCallback: function (error) {
        if (error && error.error === 100 && error.reason) {
          callback && callback(undefined, error.reason);
        } else {
          callback && callback(error);
        }
      }
    });
  };

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

      if (context.queryParams.code) {
        Meteor.loginWithWeixin(context.queryParams.code, function (error) {
          if (error) {
            console.warn(error);
          }
        });
      }

      redirect(context.queryParams.redirectPath);
    }]
  });
}
