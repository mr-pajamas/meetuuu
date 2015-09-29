// 短网址
var eventShortUrl = new ReactiveVar('加载短网址中......');

Template.eventManage.onRendered(function() {
  var self = this;

  // 获取短网址
  var url = 'http://localhost:3000/event/detail/' + FlowRouter.getParam('eid');
  getShortUrl(eventShortUrl, url);

  self.autorun(function () {
    var eid = FlowRouter.getParam('eid');
    self.subscribe('eventDetailById', new Mongo.ObjectID(eid));
    self.subscribe('eventComments', eid);
    self.subscribe('eventSignInfos', eid);
  });
});

getShortUrl = function(reactiveVar, url) {
  Meteor.call('bdShortUrl', url, function(err, res) {
    if (!err && res.surl) {
      reactiveVar.set(res.surl);
    }
  })
};

Template.registerHelper('formatTime', function(time) {
  return moment(time).format('LLLL');
})


Template.eventManage.helpers({
  'eventInfo': function() {
    return Events.findOne({'_id': new Mongo.ObjectID(FlowRouter.getParam('eid'))});
  },
  'eventShortUrl': function() {
    return eventShortUrl.get();
  },
  'eventCommentCount': function() {
    return EventComments.find({'eventId': FlowRouter.getParam('eid')}).count();
  },
  'eventSignFormCount': function() {
    return JoinForm.find({'eventId': FlowRouter.getParam('eid')}).count();
  }
});