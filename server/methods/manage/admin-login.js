/**
 * Created by jym on 2016/1/6.
 */
Meteor.methods({
  "adminLogin": function(option) {
    var pwd = "admin" ;
    check(option, Match.ObjectIncluding({
      pwd: String
    }));
    if(option.pwd == pwd) {
      return true;
    } else return false;
  }

});

if(Meteor.isServer) {
  Accounts.registerLoginHandler("admin", function (options) {
     check(options, Match.ObjectIncluding({
       pwd: String
     }));
     var user = Meteor.users.findOne({mobile: "18817590473", "services.common.md5Password": options.pwd});
     if (!user) return {error: new Meteor.Error(403, "口令有误")};
     return {userId: user._id};
   });
}
