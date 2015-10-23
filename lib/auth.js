/**
 * Created by Michael on 2015/10/5.
 */
if (Meteor.isServer) {
  Meteor.methods({
    newUser: function (options) {
      var self = this;
      return Accounts._loginMethod(self, "newUser", arguments, "common", function () {

        check(options, Match.ObjectIncluding({
          mobile: Pattern.Mobile,
          password: String,
          /*        profile: Match.Optional(Match.ObjectIncluding({
           name: Match.Optional(String),
           //wxuid: Match.Optional(String),
           //avatar: Match.Optional(String)
           }))
           */
          profile: Match.ObjectIncluding({
            name: String
          })
        }));

        var user = _.extend({
          services: {
            common: {md5Password: options.password}
          }
        }, _.omit(options, "password"));

        var userId;
        try {
          userId = Accounts.insertUserDoc(options, user);
        } catch (e) {
          if (e.name !== 'MongoError') throw e;
          var match = e.err.match(/E11000 duplicate key error index: ([^ ]+)/);
          if (!match) throw e;
          if (match[1].indexOf('mobile') !== -1)
            throw new Meteor.Error(409, "手机号已经注册");
          throw e;
        }

        return {userId: userId};
      });
    }
  });

  Accounts.registerLoginHandler("common", function (options) {

    if (!options.mobile) return undefined;

    check(options, Match.ObjectIncluding({
      mobile: Pattern.Mobile,
      password: String
    }));

    var user = Meteor.users.findOne({mobile: options.mobile, "services.common.md5Password": options.password});

    if (!user) return {error: new Meteor.Error(403, "帐号或密码有误")};

    return {userId: user._id};
  });
}

if (Meteor.isClient) {
  Accounts.newUser = function (options, callback) {
    options = _.clone(options);

    check(options, Match.ObjectIncluding({
      mobile: Pattern.Mobile,
      password: String,
      profile: Match.ObjectIncluding({
        name: String
        //wxuid: Match.Optional(String),
        //avatar: Match.Optional(String)
      })
    }));

    options.password = CryptoJS.MD5(options.password).toString();

    Accounts.callLoginMethod({
      methodName: "newUser",
      methodArguments: [options],
      userCallback: callback
    });
  };

  Meteor.commonLogin = function (options, callback) {
    options = _.clone(options);

    check(options, Match.ObjectIncluding({
      mobile: Pattern.Mobile,
      password: String
    }));

    options.password = CryptoJS.MD5(options.password).toString();

    Accounts.callLoginMethod({
      methodArguments: [options],
      userCallback: callback
    });
  };
}
