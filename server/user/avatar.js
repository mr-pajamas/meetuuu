/**
 * Created by Michael on 2015/10/25.
 */
Meteor.methods({
  uploadAvatar: function (avatarImg) {
    check(avatarImg, String);

    var url = ObjectStore.putDataUri("avatars/" + this.userId, avatarImg);

    Meteor.users.update(this.userId, {$set: {"profile.avatar": url}});
  }
});
