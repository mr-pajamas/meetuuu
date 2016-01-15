/**
 * Created by jianyanmin on 16/1/9.
 */
if(Meteor.isClient) {
  Meteor.adminManageLogin = function(option, callback) {
    Meteor.call("adminLogin", option, function(error, result) {
      if(result) {
        check(option, Match.ObjectIncluding({
          pwd: String
        }));
        option.pwd = CryptoJS.MD5(option.pwd).toString();
        Accounts.callLoginMethod({
          methodArguments: [option],
          userCallback: callback
        });
        if(Meteor.userId()) {
          FlowRouter.go("/manage/manageUsers");
        }
      }
    });
  }
}

