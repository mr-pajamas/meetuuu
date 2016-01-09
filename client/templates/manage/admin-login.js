/**
 * Created by jym on 2016/1/6.
 */
Template.adminLogin.onCreated(function(){
  Session.set('pwdError', "");
  Session.set('adminName', "");
});
Template.adminLogin.helpers({
  errorMsg: function() {
    return Session.get('pwdError');
  },
});

Template.adminLogin.events({
  "submit form": function(e, template) {
    e.preventDefault();
    var option={};
    option.pwd = template.$("#adminPassword").val();
    if(option.pwd ) {
      Session.set('pwdError', "");
      Meteor.adminManageLogin(option, function(error) {
        if(error) {
          alert(error.reason);
        } else {
          FlowRouter.go("/manage");
        }
      });
      /*Meteor.adminManageLogin(option, function (error) {
           if (error) {
             alert(error.reason);
           } else {
             FlowRouter.go("index");
           }
         });*/

     /* Meteor.call("adminLogin", option, function(error, result){
        if (!result) {
          Session.set('pwdError', "口令错误");
        } else {
          console.log("密码正确");
          Session.set('adminName', "admin");
          option.pwd = CryptoJS.MD5(option.pwd).toString();
          Accounts.callLoginMethod({
            methodArguments: [option]
          }, function (error, result) {
            console.log("结果" + result);
            FlowRouter.go("/manage");
          });

          //
        }
      });*/
    } else {
      Session.set('pwdError',"口令不能为空");
    }
  }
})
