/**
 * Created by Michael on 2015/10/25.
 */
Meteor.methods({
  uploadAvatar: function (avatarImg) {
    check(avatarImg, String);

    var url = ObjectStore.putDataUri(avatarImg);

    var oldUrl = Meteor.users.findOne(this.userId, {fields: {"profile.avatar": 1}}).profile.avatar;

    Meteor.users.update(this.userId, {$set: {"profile.avatar": url}});

    if (oldUrl) {
      Meteor.defer(function () {
        ObjectStore.removeByUrl(oldUrl);
      });
    }
  }
});
