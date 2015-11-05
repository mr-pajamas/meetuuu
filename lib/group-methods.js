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
        roles.owner = {name: "群主"};
        roles[defaultRoleId] = {
          name: "成员",
          permissions: ["create-event", "modify-event"]
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
        Memberships.insert({groupId: groupId, userId: self.userId, nickname: Meteor.user().profile.name, status: MemberStatus.Joined, statusUpdatedAt: date, role: "owner"});

        Meteor.defer(function () {
          Emitter.emit(GroupActionEvent.GroupCreated, group);
        });

        return group;
      } else {
        throw new Meteor.Error(403, "请先登录");
      }
    },

    updateGroup: function (groupOptions) {
      check(groupOptions, Match.ObjectIncluding({
        _id: String,
        path: Match.Optional(String),
        name: Match.Optional(String),
        logoImg: Match.Optional(String),
        memberAlias: Match.Optional(String),
        description: Match.Optional(String)
      }));

      var self = this;

      if (self.userId) {
        var groupId = groupOptions._id;

        var ownership = Memberships.findOne({groupId: groupId, userId: self.userId, status: MemberStatus.Joined, role: "owner"});
        if (ownership) {
          var _id = groupOptions._id;
          var logoImg = groupOptions.logoImg;
          var group = _.pick(groupOptions, "path", "name", "memberAlias", "description");

          var oldGroup = Groups.findOne(_id);
          if (oldGroup) {

            if (logoImg) {
              group.logoUrl = ObjectStore.putDataUri(logoImg);
              var oldUrl = oldGroup.logoUrl;
              if (oldUrl) {
                Meteor.defer(function () {
                  ObjectStore.removeByUrl(oldUrl);
                });
              }
            }

            Groups.update(_id, {$set: group});
            group = _.extend({}, oldGroup, group);

            Meteor.defer(function () {
              Emitter.emit(GroupActionEvent.GroupModified, group, oldGroup, self.userId);
            });

            return group;
          } else {
            throw new Meteor.Error(404, "未找到指定的社群");
          }
        } else {
          throw new Meteor.Error(403, "没有权限");
        }
      } else {
        throw new Meteor.Error(403, "请先登录");
      }
    },

    putRole: function (roleOptions) {
      check(roleOptions, Match.ObjectIncluding({
        groupId: String,
        _id: String,
        name: String,
        permissions: [String]
      }));

      if (this.userId) {
        var groupId = roleOptions.groupId;

        var ownership = Memberships.findOne({groupId: groupId, userId: this.userId, status: MemberStatus.Joined, role: "owner"});
        if (ownership) {
          var setObj = {};
          var roleKey = "roles." + roleOptions._id;
          setObj[roleKey + ".name"] = roleOptions.name;
          if (roleOptions._id !== "owner") setObj[roleKey + ".permissions"] = roleOptions.permissions;

          Groups.update(groupId, {$set: setObj});

          if (roleOptions._id !== "owner") {
            Meteor.defer(function () {
              Memberships.find({groupId: groupId, status: MemberStatus.Joined, role: roleOptions._id}).forEach(function (membership) {
                Roles.setUserRoles(membership.userId, roleOptions.permissions, "g" + groupId);
              });
            });
          }
        } else {
          throw new Meteor.Error(403, "没有权限");
        }
      } else {
        throw new Meteor.Error(403, "请先登录");
      }
    },

    applyMembership: function (applyOptions) {
      check(applyOptions, Match.ObjectIncluding({
        groupId: String,
        bio: Match.Optional(String)
      }));

      var self = this;

      if (self.userId) {

        var user = Meteor.user();

        var group = Groups.findOne(applyOptions.groupId);
        if (group) {

          var membership = Memberships.findOne({groupId: group._id, userId: self.userId});
          if (membership) {

            var setObj, groupWatching;

            if (membership.status == MemberStatus.Banned) {
              throw new Meteor.Error(403, "申请被禁止");
            } else if (membership.status == MemberStatus.Joined) {
              throw new Meteor.Error(409, "已经成为成员");
            } else if (membership.status == MemberStatus.Invited) {
              // 直接入会

              setObj = {
                status: MemberStatus.Joined,
                statusUpdatedAt: new Date(),
                role: group.defaultRole
              };
              if (applyOptions.bio) setObj.bio = applyOptions.bio;

              Memberships.update(membership._id, {$set: setObj});
              membership = _.extend(membership, setObj);

              Roles.setUserRoles(membership.userId, group.defaultRole.permissions, "g" + group._id);

              var incObj = {memberCount: 1};
              incObj["roles." + group.defaultRole + ".referenceCount"] = 1;
              groupWatching = GroupWatchings.findOne({groupId: group._id, userId: membership.userId});
              if (!groupWatching) {
                GroupWatchings.insert({groupId: group._id, userId: membership.userId});
                incObj.watchingCount = 1;
              }

              Groups.update(group._id, {$inc: incObj});

              Meteor.defer(function () {
                Emitter.emit(GroupActionEvent.MemberJoined, membership);
              });

              return membership;

            } else {
              // 申请入会

              setObj = {
                //nickname: user.profile.name,
                status: MemberStatus.Applying,
                statusUpdatedAt: new Date()
              };
              if (applyOptions.bio) setObj.bio = applyOptions.bio;

              Memberships.update(membership._id, {$set: setObj});
              membership = _.extend(membership, setObj);

              groupWatching = GroupWatchings.findOne({groupId: group._id, userId: membership.userId});
              if (!groupWatching) {
                GroupWatchings.insert({groupId: group._id, userId: membership.userId});
                Groups.update(group._id, {$inc: {watchingCount: 1}});
              }

              Meteor.defer(function () {
                Emitter.emit(GroupActionEvent.MembershipApplied, membership);
              });

              return membership;
            }
          } else {
            membership = {
              groupId: group._id,
              userId: self.userId,
              nickname: user.profile.name,
              status: MemberStatus.Applying,
              statusUpdatedAt: new Date()
            };
            if (applyOptions.bio) membership.bio = applyOptions.bio;

            Memberships.simpleSchema().clean(membership);
            membership._id = Memberships.insert(membership);

            Meteor.defer(function () {
              Emitter.emit(GroupActionEvent.MembershipApplied, membership);
            });

            return membership;
          }

        } else {
          throw new Meteor.Error(404, "指定社群不存在");
        }
      } else {
        throw new Meteor.Error(403, "请先登录");
      }
    },

    approveMembership: function (approveOptions) {
      check(approveOptions, Match.ObjectIncluding({
        groupId: String,
        membershipId: String,
        disapprove: Match.Optional(Boolean)
      }));

      var self = this;

      if (self.userId) {
        var group = Groups.findOne(approveOptions.groupId);
        if (group) {

          var membership = Memberships.findOne(approveOptions.membershipId);
          if (membership) {

            if (membership.status == MemberStatus.Applying) {

              if (Memberships.findOne({groupId: group._id, userId: self.userId, status: MemberStatus.Joined, role: "owner"}) || Roles.userIsInRole(self.userId, GroupPermission.ApproveMembership, "g" + group._id)) {

                var setObj;

                if (approveOptions.disapprove) {

                  setObj = {
                    status: MemberStatus.Left,
                    statusUpdatedAt: new Date()
                  };

                  Memberships.update(membership._id, {$set: setObj});
                  membership = _.extend(membership, setObj);

                  return membership;
                } else {
                  setObj = {
                    status: MemberStatus.Joined,
                    statusUpdatedAt: new Date(),
                    role: group.defaultRole
                  };

                  Memberships.update(membership._id, {$set: setObj});
                  membership = _.extend(membership, setObj);

                  Roles.setUserRoles(membership.userId, group.roles[group.defaultRole].permissions, "g" + group._id);

                  var incObj = {memberCount: 1};
                  incObj["roles." + group.defaultRole + ".referenceCount"] = 1;
                  var groupWatching = GroupWatchings.findOne({groupId: group._id, userId: membership.userId});
                  if (!groupWatching) {
                    GroupWatchings.insert({groupId: group._id, userId: membership.userId});
                    incObj.watchingCount = 1;
                  }

                  Groups.update(group._id, {$inc: incObj});

                  Meteor.defer(function () {
                    Emitter.emit(GroupActionEvent.MemberJoined, membership);
                  });

                  return membership;
                }
              } else {
                throw new Meteor.Error(403, "没有审批权限");
              }
            } else {
              throw new Meteor.Error(409, "无法审批，申请状态错误");
            }
          } else {
            throw new Meteor.Error(404, "指定的入会申请不存在");
          }
        } else {
          throw new Meteor.Error(404, "指定社群不存在");
        }
      } else {
        throw new Meteor.Error(403, "请先登录");
      }
    }
  });

  // 允许群主任意修改俱乐部
  Groups.allow({
    update: function (userId, doc, fields, modifier) {
      if (!userId) return false;
      var membership = Memberships.findOne({groupId: doc._id, userId: userId, status: MemberStatus.Joined, role: "owner"});
      if (!membership) return false;

      return _.intersection(fields, ["founderId", "foundedDate", "memberCount", "eventCount", "topicCount", "watchingCount"]).length === 0;
    },
    fetch: ["_id"]
  });
}
