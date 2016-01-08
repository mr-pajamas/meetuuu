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
    var pwd = template.$("#adminPassword").val();
    if(pwd) {
      Session.set('pwdError', "");
      Meteor.call("adminLogin", pwd, function(error, result){
        if(result) {
          Session.set('adminName', pwd);
          FlowRouter.go("/manage");
        } else {
          Session.set('pwdError', "口令错误");
        }
      });
    } else {
      Session.set('pwdError',"口令不能为空");
    }
  }
})
