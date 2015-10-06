/**
 * Created by Michael on 2015/10/5.
 */

Accounts.newUser = function (options, callback) {
  options = _.clone(options);

  check(options, Match.ObjectIncluding({
    mobile: String,
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
