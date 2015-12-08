/**
 * Created by Michael on 2015/10/26.
 */
if (Meteor.isServer) {
  Meteor.methods({
    createGroup: function (options) {
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
        }, _.omit(options, ["_id", "founderId", "foundedDate", "memberCount", "eventCount", "topicCount", "watchingCount", "defaultRole", "roles"]));

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

    updateGroup: function (options) {
      check(options, Match.ObjectIncluding({
        _id: String,
        path: Match.Optional(String),
        name: Match.Optional(String),
        logoImg: Match.Optional(String),
        memberAlias: Match.Optional(String),
        description: Match.Optional(String)
      }));

      var self = this;

      if (self.userId) {
        var groupId = options._id;

        var ownership = Memberships.findOne({groupId: groupId, userId: self.userId, status: MemberStatus.Joined, role: "owner"});
        if (ownership) {
          var _id = options._id;
          var logoImg = options.logoImg;
          var group = _.pick(options, "path", "name", "memberAlias", "description");

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

    putRole: function (options) {
      check(options, Match.ObjectIncluding({
        groupId: String,
        _id: String,
        name: String,
        permissions: [String]
      }));

      if (this.userId) {
        var groupId = options.groupId;

        var ownership = Memberships.findOne({groupId: groupId, userId: this.userId, status: MemberStatus.Joined, role: "owner"});
        if (ownership) {
          var setObj = {};
          var roleKey = "roles." + options._id;
          setObj[roleKey + ".name"] = options.name;
          if (options._id !== "owner") setObj[roleKey + ".permissions"] = options.permissions;

          Groups.update(groupId, {$set: setObj});

          if (options._id !== "owner") {
            Meteor.defer(function () {
              Memberships.find({groupId: groupId, status: MemberStatus.Joined, role: options._id}).forEach(function (membership) {
                Roles.setUserRoles(membership.userId, options.permissions, "g" + groupId);
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

    applyMembership: function (options) {
      check(options, Match.ObjectIncluding({
        groupId: String,
        bio: Match.Optional(String)
      }));

      var self = this;

      if (self.userId) {

        var user = Meteor.user();

        var group = Groups.findOne(options.groupId);
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
              if (options.bio) setObj.bio = options.bio;

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
              if (options.bio) setObj.bio = options.bio;

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
            if (options.bio) membership.bio = options.bio;

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

    approveMembership: function (options) {
      check(options, Match.ObjectIncluding({
        //groupId: String,
        membershipId: String,
        disapprove: Match.Optional(Boolean)
      }));

      var self = this;

      if (self.userId) {

        var membership = Memberships.findOne(options.membershipId);
        if (membership && membership.status == MemberStatus.Applying) {

          var group = Groups.findOne(membership.groupId);
          if (group) {

            if (Memberships.findOne({groupId: group._id, userId: self.userId, status: MemberStatus.Joined, role: "owner"}) || Roles.userIsInRole(self.userId, GroupPermission.ApproveMembership, "g" + group._id)) {

              var setObj;

              if (options.disapprove) {

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
            throw new Meteor.Error(404, "指定社群不存在");
          }
        } else {
          throw new Meteor.Error(404, "指定的入会申请不存在");
        }
      } else {
        throw new Meteor.Error(403, "请先登录");
      }
    },

    assignRole: function (options) {
      check(options, Match.ObjectIncluding({
        membershipId: String,
        role: Match.Optional(String)
      }));

      if (options.role === "owner") throw new Meteor.Error(400, "群主角色不可分配");

      var self = this;

      if (self.userId) {

        var membership = Memberships.findOne(options.membershipId);

        if (membership && membership.status == MemberStatus.Joined) {

          if (membership.role !== "owner") {
            var group = Groups.findOne(membership.groupId);
            if (group) {

              options.role = options.role || group.defaultRole;

              if (Memberships.findOne({groupId: group._id, userId: self.userId, status: MemberStatus.Joined, role: "owner"})) {

                if (membership.role !== options.role) {

                  Memberships.update(membership._id, {$set: {role: options.role}});

                  Roles.setUserRoles(membership.userId, group.roles[options.role].permissions, "g" + group._id);

                  var incObj = {};
                  incObj["roles." + options.role + ".referenceCount"] = 1;
                  incObj["roles." + membership.role + ".referenceCount"] = -1;

                  Groups.update(group._id, {$inc: incObj});

                  membership.role = options.role;

                  Meteor.defer(function () {
                    Emitter.emit(GroupActionEvent.RoleAssigned, membership);
                  });
                }

                return membership;
              } else {
                throw new Meteor.Error(403, "没有权限");
              }
            } else {
              throw new Meteor.Error(404, "指定社群不存在");
            }
          } else {
            throw new Meteor.Error(400, "不能对群主分配角色");
          }
        } else {
          throw new Meteor.Error(404, "指定的成员不存在");
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
