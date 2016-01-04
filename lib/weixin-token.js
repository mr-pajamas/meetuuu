/**
 * Created by Michael on 2015/12/19.
 */
if (Meteor.isServer) {

  var renewWindow = moment.duration(10, "m");
  var renewTimeout = moment.duration(30, "s");
  var renewWait = moment.duration(1, "m");

  WxToken = function (doc) {
    _.extend(this, doc);
  };

  _.extend(WxToken.prototype, {
    isFresh: function () {
      return !!this.accessToken && moment().add(renewWindow).isBefore(this.accessToken.expiration);
    },
    isRenewing: function () {
      return !!this.renewAt && moment().subtract(renewTimeout).isBefore(this.renewAt);
    }
  });

  function fetchAccessToken() {
    var resultData = HTTP.get("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential", {
      params: {appid: WxPlatform.public.appId, secret: WxPlatform.public.appSecret},
      timeout: renewTimeout.asMilliseconds()
    }).data;

    if (resultData.access_token) {
      return {
        token: resultData.access_token,
        expiration: moment().add(resultData.expires_in, "s").toDate()
      };
    } else {
      throw new Error("获取微信access_token失败：" + "[" + resultData.errcode + "] " + resultData.errmsg);
    }
  }

  WxTokens = new Meteor.Collection("wx-tokens", {transform: function (doc) {
    return new WxToken(doc);
  }});

  WxTokens.attachSchema({
    appId: {
      type: String,
      index: true,
      unique: true
    },
    accessToken: {
      type: Object,
      optional: true
    },
    "accessToken.token": {
      type: String
    },
    "accessToken.expiration": {
      type: Date
    },
    renewAt: {
      type: Date,
      optional: true
    }
  });

  function renewToken() {

    var wxToken = WxTokens.findOne({appId: WxPlatform.public.appId});
    if (wxToken.isFresh()) {
      // 下一轮定时
      Meteor.setTimeout(renewToken, moment(wxToken.accessToken.expiration)
          .subtract(renewTimeout)
          .subtract(_.random(renewWindow.subtract(renewTimeout).asSeconds()), "s")
          .diff(moment())
      );
    } else {
      if (wxToken.isRenewing()) {
        // 重新定时
        Meteor.setTimeout(renewToken, renewWait.asMilliseconds());

      } else {
        // 发送请求，记录请求时间

        WxTokens.update(wxToken._id, {$set: {renewAt: new Date()}});

        try {
          var accessToken = fetchAccessToken();

          WxTokens.update(wxToken._id, {$set: {accessToken: accessToken}});
          wxToken.accessToken = accessToken;

          // 开始下一轮定时
          Meteor.setTimeout(renewToken, moment(wxToken.accessToken.expiration)
              .subtract(renewTimeout)
              .subtract(_.random(renewWindow.subtract(renewTimeout).asSeconds()), "s")
              .diff(moment())
          );
        } catch (e) {
          console.log(e);

          // 获取失败或者超时，清除时间记录，重新定时
          WxTokens.update(wxToken._id, {$unset: {renewAt: ""}});
          wxToken = _.omit(wxToken, "renewAt");

          // 重新定时
          Meteor.setTimeout(renewToken, renewWait.asMilliseconds());
        }
      }
    }
  }

  Meteor.startup(function () {
    WxTokens.upsert({appId: WxPlatform.public.appId}, {$setOnInsert: {appId: WxPlatform.public.appId}});
    Meteor.defer(function () {
      renewToken();
    });
  });
}
