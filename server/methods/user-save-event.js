Meteor.methods({
  'toggleSaveEvent': function(eventInfo) {
    check(eventInfo, Object);
    var selector = {'event.id': eventInfo.id, 'user.id': Meteor.userId()};
    if (UserSavedEvents.findOne(selector)) {
      UserSavedEvents.remove(selector);
      return;
    }
    var doc = {
      event: eventInfo,
      user: {
        name: Meteor.user().profile.name,
        id: Meteor.userId()
      }
    };
    UserSavedEvents.insert(doc);
  }
});