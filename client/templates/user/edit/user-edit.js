/**
 * Created by cy on 22/10/15.
 */

Session.setDefault("userInfoSet", false);

Template.userEdit.helpers({
  "userBasicInfo": function () {
    return Meteor.user();
  },
  "personalAvatar": function () {
    return this.avatar ? this.avatar : "/images/default-avatar.jpg";
  }
});

Template.userEdit.events({
  "click #saveInfo": function (e) {
    var temp = {};
    temp.name = $("#user-name").val();
    temp.gender = $("input[name='gender']:checked").val();
    if (temp.name) {
      if (temp.name.length <= 10) {
        Meteor.users.update({_id: Meteor.userId()},
          {$set: {"profile.name": temp.name, "profile.gender": temp.gender}},
          function (err, res) {
            console.log(err);
            if (res) {
              history.back();
              Session.set("userInfoSet", true);
            }
          });
      } else {
        alert("姓名必须小于10个字")
      }
    }
    else {
      alert("请填写姓名");
    }
  }
});
