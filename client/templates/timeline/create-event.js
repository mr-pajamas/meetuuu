/**
 * Created by Michael on 2015/11/5.
 */
Template.timelineCreateEvent.onCreated(function () {
  this.subscribe("eventDetailById", this.data.groupTimelineItem.data.eventId);
});

Template.timelineCreateEvent.helpers({
  event: function () {
    return Events.findOne(this.groupTimelineItem.data.eventId);
  }
});
