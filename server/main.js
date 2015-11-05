/**
 * Created by Michael on 2015/10/22.
 */
Meteor.startup(function () {
  if (Meteor.users.find().count() === 0) {
    var users = [
      {
        mobile: 18000000001,
        createdAt: new Date(),
        profile: {
          name: "张三"
        },
        services: {
          common: {md5Password: CryptoJS.MD5("123qwe").toString()}
        }
      },
      {
        mobile: 18000000002,
        createdAt: new Date(),
        profile: {
          name: "李四",
          gender: "男"
        },
        services: {
          common: {md5Password: CryptoJS.MD5("123qwe").toString()}
        }
      },
      {
        mobile: 18000000003,
        createdAt: new Date(),
        profile: {
          name: "王五",
          traits: [
            {
              name: "90后",
              labeler: Random.id(),
              labeledAt: new Date()
            },
            {
              name: "暖男",
              labeler: Random.id(),
              labeledAt: new Date()
            }
          ]
        },
        services: {
          common: {md5Password: CryptoJS.MD5("123qwe").toString()}
        }
      }
    ];

    _.each(users, function (user) {
      user._id = Meteor.users.insert(user);
    });

    var groups = [
      {
        path: "group1",
        name: "测试俱乐部1",
        founderId: users[0]._id,
        foundedDate: new Date(),
        homeCity: CITIES[0],
        memberCount: 2,
        description: "欢迎大家加入！",
        defaultRole: "2g42gkbMGivsFBfKn",
        roles: {
          owner: {name: "校长"},
          "2g42gkbMGivsFBfKn": {name: "学生", permissions: [], referenceCount: 2}
        }
      },
      {
        path: "group2",
        name: "测试俱乐部2",
        founderId: users[1]._id,
        foundedDate: new Date(),
        homeCity: CITIES[1],
        memberCount: 2,
        description: "想来便来想走便走",
        defaultRole: "hZKu3ssFiPWpF5k7i",
        roles: {
          owner: {name: "组长"},
          "hZKu3ssFiPWpF5k7i": {name: "成员", permissions: ["create-event", "modify-event"], referenceCount: 1}
        }
      }
    ];

    _.each(groups, function (group) {
      group._id = Groups.insert(group);
    });

    var memberShips = [
      {
        groupId: groups[0]._id,
        userId: users[0]._id,
        nickname: "张三0",
        status: MemberStatus.Joined,
        statusUpdatedAt: new Date(),
        role: "owner"
      },
      {
        groupId: groups[1]._id,
        userId: users[0]._id,
        nickname: "张三1",
        status: MemberStatus.Joined,
        statusUpdatedAt: new Date(),
        role: "hZKu3ssFiPWpF5k7i"
      },
      {
        groupId: groups[1]._id,
        userId: users[1]._id,
        nickname: "李四1",
        status: MemberStatus.Joined,
        statusUpdatedAt: new Date(),
        role: "owner"
      },
      {
        groupId: groups[0]._id,
        userId: users[2]._id,
        nickname: "王五0",
        status: MemberStatus.Joined,
        statusUpdatedAt: new Date(),
        role: "2g42gkbMGivsFBfKn"
      },
      {
        groupId: groups[0]._id,
        userId: users[1]._id,
        nickname: "lili",
        status: MemberStatus.Joined,
        statusUpdatedAt: new Date(),
        role: "2g42gkbMGivsFBfKn"
      }
    ];

    _.each(memberShips, function (memberShip) {
      memberShip._id = Memberships.insert(memberShip);
    });

    var groupWatchings = [
      {
        groupId: groups[0]._id,
        userId: users[0]._id
      },
      {
        groupId: groups[1]._id,
        userId: users[1]._id
      }
    ];

    _.each(groupWatchings, function (groupWatching) {
      groupWatching._id = GroupWatchings.insert(groupWatching);
    });

    var traitUsages = [
      {
        trait: "90后",
        userCount: 1
      },
      {
        trait: "暖男",
        userCount: 1
      }
    ];

    _.each(traitUsages, function (traitUsage) {
      traitUsage._id = TraitUsages.insert(traitUsage);
    });

    Roles.addUsersToRoles(users[0]._id, ['create-event', 'modify-event'], 'g' + groups[1]._id);
    Roles.addUsersToRoles(users[1]._id, ['create-event', 'create-open-event', 'cancel-event'], 'g' + groups[0]._id);
    Roles.addUsersToRoles(users[2]._id, ['create-event', 'deny-entry'], 'g' + groups[0]._id);
  }
});
