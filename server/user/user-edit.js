/**
 * Created by cy on 28/10/15.
 */

Meteor.methods({
  updateUserInfo: function (userInfo) {
    check(userInfo, Object);

    var avatarUrl, oldUrl;

    var setOptions = {
      "profile.name": userInfo.name,
      "profile.gender": userInfo.gender
    };

    if (userInfo.avatar) {
      oldUrl = Meteor.users.findOne(this.userId, {fields: {"profile.avatar": 1}}).profile.avatar;
      avatarUrl = ObjectStore.putDataUri(userInfo.avatar);
      setOptions["profile.avatar"] = avatarUrl;
    }

    Meteor.users.update(this.userId, {$set: setOptions});

    if (oldUrl) {
      Meteor.defer(function () {
        ObjectStore.removeByUrl(oldUrl);
      });
    }
  }
});
