Template.eventManage.onRendered(function() {
  var self = this;

  self.autorun(function () {
    var eid = FlowRouter.getParam('eid');
    self.subscribe('eventDetailById', new Mongo.ObjectID(eid));
  });
});


Template.eventManage.helpers({
  'eventInfo': function() {
    return Events.findOne({'_id': new Mongo.ObjectID(FlowRouter.getParam('eid'))});
  }
});