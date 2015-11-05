/**
 * Created by Michael on 2015/11/5.
 */
if (Meteor.isServer) {
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

  // 允许当前用户任意修改自己的信息
  Meteor.users.allow({
    update: function (userId, doc, fields, modifier) {
      if (userId == doc._id) {
        return _.intersection(fields, ["username", "emails", "mobile", "createdAt", "services", "roles"]).length === 0;
      }
    },
    fetch: ["_id"]
  });
}
