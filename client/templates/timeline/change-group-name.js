/**
 * Created by Michael on 2015/11/4.
 */
Template.timelineChangeGroupName.helpers({
  oldNamePartial: function () {
    return "什么" + this.groupTimelineItem.data.oldName.substring(2);
  }
});
