/**
 * Created by Michael on 2015/11/27.
 */
if (typeof WxPlatform === "undefined") WxPlatform = {};
Meteor._ensure(WxPlatform, "open");
Meteor._ensure(WxPlatform, "public");

WxPlatform.open.appId = "wx1332dbfdec23c549";
WxPlatform.open.linkFormat = _.template("https://open.weixin.qq.com/connect/qrconnect?<%= queryParams %>#wechat_redirect");
WxPlatform.open.scope = "snsapi_login";
WxPlatform.open.state = "open";

WxPlatform.public.appId = "wxd733d4919562ba78";
WxPlatform.public.linkFormat = _.template("https://open.weixin.qq.com/connect/oauth2/authorize?<%= queryParams %>#wechat_redirect");
WxPlatform.public.scope = "snsapi_userinfo";
WxPlatform.public.state = "public";


WxUsers = new Mongo.Collection("wx-users");

WxUsers.attachSchema(new SimpleSchema({
  userId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  /*
   openid: {
   type: String,
   denyUpdate: true,
   index: true,
   unique: true
   },
   */
  unionid: {
    type: String,
    //optional: true,
    denyUpdate: true,
    index: true,
    unique: true
    //sparse: true
  },
  nickname: {
    type: String,
    optional: true
  },
  sex: {
    type: Number,
    allowedValues: [1, 2],
    //defaultValue: 0,
    optional: true
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

  WxOauth = function (platform, code) {

    var accessToken;
    var wxUser;

    function getAccessToken() {

      var resultContent = HTTP.get("https://api.weixin.qq.com/sns/oauth2/access_token?grant_type=authorization_code", {
        params: {
          appid: platform.appId,
          secret: platform.appSecret,
          code: code
        }
      }).content;

      var resultData = JSON.parse(resultContent);

      if (resultData.access_token) {
        var scope = resultData.scope;

        wxUser = {
          openid: resultData.openid,
          unionid: resultData.unionid
        };

        //if (resultData.unionid) wxUser.unionid = resultData.unionid;

        //if (scope === "snsapi_userinfo") accessToken = resultData.access_token;
        if (scope !== "snsapi_base") accessToken = resultData.access_token;
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

      //var persisted = WxUsers.findOne({openid: wxUser.openid});
      var persisted = WxUsers.findOne({unionid: wxUser.unionid});

      if (persisted) {
        var setObj = _.omit(wxUser, "openid", "unionid");
        if (!_.isEmpty(setObj)) {
          WxUsers.update(persisted._id, {$set: setObj});
        }

        wxUser = _.extend(persisted, wxUser);
      } else {
        wxUser._id = WxUsers.insert(_.omit(wxUser, "openid"));
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

    this.wxUser = _.omit(wxUser, "openid");
  };

  Meteor.methods({
    wxLogin: function (options) {
      return Accounts._loginMethod(this, "wxLogin", arguments, "wxOauth", function () {
        check(options, Match.ObjectIncluding({
          platform: String,
          code: String
        }));

        var platform = WxPlatform[options.platform];
        if (!platform) {
          return {error: new Meteor.Error(400, "平台参数错误")};
        }

        var wxUser;

        try {
          wxUser = new WxOauth(platform, options.code).wxUser;
        } catch (e) {
          return {error: new Meteor.Error(500, e.message)};
        }

        if (wxUser.userId) {
          return {userId: wxUser.userId};
        } else {
          return {error: new Meteor.Error(100, wxUser._id)};
        }
      });
    },
    newWxUser: function (options) {
      return Accounts._loginMethod(this, "newWxUser", arguments, "wxOauth", function () {

        check(options, Match.ObjectIncluding({
          mobile: Pattern.Mobile,
          wxUserId: String
        }));

        var user = Meteor.users.findOne({mobile: options.mobile});
        var wxUser;
        if (user) {
          WxUsers.update(options.wxUserId, {$set: {userId: user._id}});

          if (!user.profile.gender || !user.profile.avatar) {
            wxUser = WxUsers.findOne(options.wxUserId);

            if (wxUser.sex || wxUser.headimgurl) {
              var setObj = {};
              if (!user.profile.gender && wxUser.sex) {
                setObj["profile.gender"] = (wxUser.sex === 1 ? "男" : "女");
              }
              if (!user.profile.avatar && wxUser.headimgurl) {
                setObj["profile.avatar"] = wxUser.headimgurl;
              }

              Meteor.users.update(user._id, {$set: setObj});
            }
          }
        } else {
          wxUser = WxUsers.findOne(options.wxUserId);
          if (!wxUser.nickname) return {error: new Meteor.Error(409, "微信授权信息不完整")};

          user = {
            mobile: options.mobile,
            profile: {
              name: wxUser.nickname
            }
          };

          if (wxUser.sex) user.profile.gender = (wxUser.sex === 1 ? "男" : "女");
          if (wxUser.headimgurl) user.profile.avatar = wxUser.headimgurl;

          user._id = Accounts.insertUserDoc(options, user);
          WxUsers.update(options.wxUserId, {$set: {userId: user._id}});
        }

        return {userId: user._id};
      });
    }
  });
}

if (Meteor.isClient) {
  Meteor.isWeixin = navigator.userAgent.toLowerCase().indexOf("micromessenger") !== -1;

  Meteor.loginWithWeixin = function (options, callback) {
    check(options, Match.ObjectIncluding({
      platform: String,
      code: String
    }));

    Accounts.callLoginMethod({
      methodName: "wxLogin",
      methodArguments: [options],
      userCallback: function (error) {
        if (error && error.error == 100 && error.reason) {
          callback && callback(undefined, error.reason);
        } else {
          callback && callback(error);
        }
      }
    });
  };

  Accounts.newWxUser = function (options, callback) {
    options = _.clone(options);

    check(options, Match.ObjectIncluding({
      mobile: Pattern.Mobile,
      wxUserId: String
    }));

    Accounts.callLoginMethod({
      methodName: "newWxUser",
      methodArguments: [options],
      userCallback: callback
    });
  };

  var skipAutoSignin = !Meteor.isWeixin;
  // skipAutoSignin = true;

  FlowRouter.triggers.enter([function (context, redirect, stop) {

    if (!skipAutoSignin) {
      skipAutoSignin = true;

      Tracker.autorun(function (c) {
        if (!Meteor.loggingIn()) {
          c.stop();
          if (Meteor.user()) {
            FlowRouter.reload();
          } else {

            window.location.replace(Meteor.wxOauthLink(WxPlatform.public, {
              redirect_uri: FlowRouter.url("wxOauth", {}, {redirectPath: context.path}),
              scope: "snsapi_base",
              state: "silent"
            }));
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

      var silent = context.queryParams.state === "silent";

      if (silent) {
        if (context.queryParams.code) {
          Meteor.loginWithWeixin({platform: "public", code: context.queryParams.code}, function (error) {
            if (error) {
              //alert(JSON.stringify(error));
              console.warn(error);
            }
          });
        }

        redirect(context.queryParams.redirectPath);
      }
    }],
    action: function (params, queryParams) {
      if (queryParams.code) {
        BlazeLayout.render("layout", {main: "loading"});

        Meteor.loginWithWeixin({platform: queryParams.state, code: queryParams.code}, function (error, result) {
          if (error) {
            alert("微信授权失败：" + error.reason); // TODO: 使用fallback机制
          } else if (result) {
            Session.set("wxUserId", result);
          }

          FlowRouter.go(queryParams.redirectPath);
        });
      } else {
        FlowRouter.go(queryParams.redirectPath);
      }
    }
  });

  Template.registerHelper("weixin", function (value) {
    return Meteor.isWeixin && (value || true);
  });

  Meteor.wxOauthLink = function (platform, params) {
    params = params || {};
    return platform.linkFormat({queryParams: $.param({
      appid: platform.appId,
      redirect_uri: params.redirect_uri || FlowRouter.url("wxOauth", {}, {redirectPath: FlowRouter.current().path}),
      response_type: "code",
      scope: params.scope || platform.scope,
      state: params.state || platform.state
    })});
  }
}
