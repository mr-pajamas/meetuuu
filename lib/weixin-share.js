/**
 * Created by Michael on 2016/1/4.
 */
if (Meteor.isClient) {
  var c;

  var WX_SHARE_DATA = {
    title: "MeetUUU",
    desc: "做想做的事，见想见的人",
    link: "http://meetuuu.com",
    imgUrl: "https://mp.weixin.qq.com/misc/getheadimg?token=1701277663&fakeid=3205103972&r=716784"
  };

  FlowRouter.triggers.enter([function () {
    c = Tracker.autorun(function () {
      if (wx.configReady()) {
        wx.onMenuShareTimeline(WX_SHARE_DATA);
        wx.onMenuShareAppMessage(WX_SHARE_DATA);
      }
    });
  }], {except: ["eventDetail"]});

  FlowRouter.triggers.exit([function () {
    c && c.stop();
    c = undefined;
  }]);
}
