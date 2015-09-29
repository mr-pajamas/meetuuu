Meteor.methods({
  'submitJoinForm': function(joinForm) {
    // TODO 添加用户信息
    var id = JoinForm.insert(joinForm);
    return {'code': id ? 0 : -1};
  }
})