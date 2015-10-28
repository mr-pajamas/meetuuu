/**
 * Created by Michael on 2015/10/27.
 */
Template.groupLayout.onCreated(function () {
  var template = this;

  template.autorun(function () {
    template.groupHandle && template.groupHandle.stop();
    template.groupHandle = template.subscribe("singleGroupByPath", FlowRouter.getParam("groupPath"));
  });
});

Template.groupLayout.helpers({
  groupReady: function () {
    return Template.instance().groupHandle.ready();
  },
  group: function () {
    return Groups.findOne({path: FlowRouter.getParam("groupPath")});
  }
});
