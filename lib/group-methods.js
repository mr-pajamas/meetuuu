/**
 * Created by Michael on 2015/10/26.
 */
if (Meteor.isServer) {
  Meteor.methods({
    createGroup: function (groupOptions) {
      if (this.userId) {
        var self = this;
        var groupId = Random.id();
        var date = new Date();
        var defaultRoleId = Random.id();
        var roles = {};
        roles.owner = {name: "组长"};
        roles[defaultRoleId] = {
          name: "成员",
          permissions: ["create-topic", "modify-own-topic", "close-own-topic"]
        };

        var group = _.extend({
          _id: groupId,
          path: groupId,
          founderId: self.userId,
          foundedDate: date,
          defaultRole: defaultRoleId,
          roles: roles
        }, _.omit(groupOptions, ["_id", "founderId", "foundedDate", "memberCount", "eventCount", "topicCount", "watchingCount", "defaultRole", "roles"]));

        Groups.simpleSchema().clean(group);
        group._id = groupId;

        Groups.insert(group);
        GroupWatchings.insert({groupId: groupId, userId: self.userId});
        Memberships.insert({groupId: groupId, userId: self.userId, nickname: Meteor.user().profile.name, joinDate: date, role: "owner"});
        // TODO: 添加权限
        var user = Meteor.user();
        Meteor.defer(function () {
          Emitter.emit(Event.CREATE_GROUP, user, group);
        });

        return group;
      } else {
        throw new Meteor.Error(403, "请先登录");
      }
    }
  });
}
