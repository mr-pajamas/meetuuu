/**
 * Created by Michael on 2015/10/5.
 */
Meteor.methods({
  newUser: function (options) {
    var self = this;
    return Accounts._loginMethod(self, "newUser", arguments, "common", function () {

      check(options, Match.ObjectIncluding({
        mobile: String,
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
