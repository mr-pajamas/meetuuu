Template.eventManage.onRendered(function() {
  var self = this,
      eid = FlowRouter.getParam('eid');

  self.autorun(function () {
    self.subscribe('eventDetailById', eid);
  });
});


Template.eventManage.helpers({
  'eventInfo': function() {
    return Events.findOne({'_id': FlowRouter.getParam('eid')});
  }
});