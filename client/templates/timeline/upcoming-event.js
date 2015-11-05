/**
 * Created by Michael on 2015/11/5.
 */
Template.timelineUpcomingEvent.onCreated(function () {
  this.subscribe("eventDetailById", this.data.groupTimelineItem.data.eventId);
});

Template.timelineUpcomingEvent.helpers({
  event: function () {
    return Events.findOne(this.groupTimelineItem.data.eventId);
  }
});
