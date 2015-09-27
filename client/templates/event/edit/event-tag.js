Template.eventTag.events({
  'click i.delete-event-tag': function(e) {
    e.preventDefault();
    var $spanTag = $(e.currentTarget).parent(),
        id = $spanTag.attr('id');
    EditEvent.eventTags.deleteTag(id)
  }
});