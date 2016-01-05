/**
 * Created by Michael on 2015/12/30.
 */
if (Meteor.isServer) {

  var renewWindow = moment.duration(10, "m");
  var renewTimeout = moment.duration(30, "s");
  var renewWait = moment.duration(1, "m");

  WxJsTicket = function (doc) {
    _.extend(this, doc);
  };

  _.extend(WxJsTicket.prototype, {
    isFresh: function () {
      return !!this.jsTicket && moment().add(renewWindow).isBefore(this.jsTicket.expiration);
    },
    isRenewing: function () {
      return !!this.renewAt && moment().subtract(renewTimeout).isBefore(this.renewAt);
    }
  });

  function fetchJsTicket() {
    var wxToken = WxTokens.findOne({appId: WxPlatform.public.appId});

    var resultData = HTTP.get("https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=jsapi", {
      params: {access_token: wxToken.accessToken.token},
      timeout: renewTimeout.asMilliseconds()
    }).data;

    if (resultData.ticket) {
      return {
        ticket: resultData.ticket,
        expiration: moment().add(resultData.expires_in, "s").toDate()
      };
    } else {
      throw new Error("获取微信jsapi_ticket失败：" + "[" + resultData.errcode + "] " + resultData.errmsg);
    }
  }

  WxJsTickets = new Meteor.Collection("wx-js-tickets", {transform: function (doc) {
    return new WxJsTicket(doc);
  }});

  WxJsTickets.attachSchema({
    appId: {
      type: String,
      index: true,
      unique: true
    },
    jsTicket: {
      type: Object,
      optional: true
    },
    "jsTicket.ticket": {
      type: String
    },
    "jsTicket.expiration": {
      type: Date
    },
    renewAt: {
      type: Date,
      optional: true
    }
  });

  function renewTicket() {

    var wxJsTicket = WxJsTickets.findOne({appId: WxPlatform.public.appId});
    if (wxJsTicket.isFresh()) {
      // 下一轮定时
      Meteor.setTimeout(renewTicket, moment(wxJsTicket.jsTicket.expiration)
          .subtract(renewTimeout)
          .subtract(_.random(renewWindow.subtract(renewTimeout).asSeconds()), "s")
          .diff(moment())
      );
    } else {
      if (wxJsTicket.isRenewing()) {
        // 重新定时
        Meteor.setTimeout(renewTicket, renewWait.asMilliseconds());
      } else {
        // 发送请求，记录请求时间

        WxJsTickets.update(wxJsTicket._id, {$set: {renewAt: new Date()}});

        try {
          var jsTicket = fetchJsTicket();

          WxJsTickets.update(wxJsTicket._id, {$set: {jsTicket: jsTicket}});
          wxJsTicket.jsTicket = jsTicket;

          // 开始下一轮定时
          Meteor.setTimeout(renewTicket, moment(wxJsTicket.jsTicket.expiration)
              .subtract(renewTimeout)
              .subtract(_.random(renewWindow.subtract(renewTimeout).asSeconds()), "s")
              .diff(moment())
          );
        } catch (e) {
          console.log(e);

          // 获取失败或者超时，清除时间记录，重新定时
          WxJsTickets.update(wxJsTicket._id, {$unset: {renewAt: ""}});
          wxJsTicket = _.omit(wxJsTicket, "renewAt");

          // 重新定时
          Meteor.setTimeout(renewTicket, renewWait.asMilliseconds());
        }
      }
    }
  }

  function sign(nonceStr, jsTicket, timestamp, url) {
    var a = [];
    a.push("jsapi_ticket=" + jsTicket);
    a.push("noncestr=" + nonceStr);
    a.push("timestamp=" + timestamp);
    a.push("url=" + url);

    var string1 = a.join("&");

    return CryptoJS.SHA1(string1).toString();
  }

  Meteor.methods({
    wxJsSign: function (noncestr, timestamp, url) {
      this.unblock();
      return sign(noncestr, WxJsTickets.findOne({appId: WxPlatform.public.appId}).jsTicket.ticket, timestamp, url);
    }
  });

  Meteor.startup(function () {
    WxJsTickets.upsert({appId: WxPlatform.public.appId}, {$setOnInsert: {appId: WxPlatform.public.appId}});

    var query = WxTokens.find({appId: WxPlatform.public.appId, accessToken: {$exists: true, $ne: null}, "accessToken.expiration": {$gt: new Date()}}, {reactive: false});

    var handle = query.observeChanges({
      added: function () {
        renewTicket();
      }
    });
  });
}


if (Meteor.isClient) {
  var wxConfigReady = new ReactiveVar(false);

  wx.configReady = function () {
    return wxConfigReady.get();
  };

  FlowRouter.triggers.enter([function (context) {
    var url = FlowRouter.url(context.path);
    //alert(url);

    var timestamp = Math.floor(new Date().getTime() / 1000);
    var nonceStr = Random.id();

    Meteor.call("wxJsSign", nonceStr, timestamp, url, function (error, result) {
      if (result) {
        alert(JSON.stringify({
          debug: false,
          appId: WxPlatform.public.appId,
          timestamp: timestamp,
          nonceStr: nonceStr,
          signature: result,
          jsApiList: ["onMenuShareTimeline", "onMenuShareAppMessage"]
        }));

        wx.config({
          debug: false,
          appId: WxPlatform.public.appId,
          timestamp: timestamp,
          nonceStr: nonceStr,
          signature: result,
          jsApiList: ["onMenuShareTimeline", "onMenuShareAppMessage"]
        });

        wx.ready(function () {
          alert("可以分享了");
          wxConfigReady.set(true);
        });

        wx.error(function (res) {
          alert("微信签名错误：" + res.errMsg);
          //console.error(res.errMsg);
        });
      } else {
        console.error(error);
      }
    });

  }], {except: ["index", "wxOauth"]});

  FlowRouter.triggers.exit([function () {
    wxConfigReady.set(false);
  }]);
}
