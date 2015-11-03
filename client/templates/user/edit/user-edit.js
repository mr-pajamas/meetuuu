/**
 * Created by cy on 22/10/15.
 */

Template.userEdit.helpers({
  "userBasicInfo": function () {
    return Meteor.user();
  }
});

Template.userEdit.events({
    "click #saveInfo": function (event, template) {

      var target = event.currentTarget;

      $(target).attr("disabled", true).text("保存中...");

      var userInfo = {};
      userInfo.name = $("#user-name").val();
      userInfo.gender = $("input[name='gender']:checked").val();

      if (userInfo.name.length <= 10) {
        var avatar = template.$("#upload-avatar").find(".img-upload").imgUpload("crop");
        if (avatar) {
          userInfo.avatar = avatar;
        }
        Meteor.call("updateUserInfo", userInfo, function (error) {
            $(target).attr("disabled", false).text("保存");
            if (!error) {
              FlowRouter.go("user", {userId: FlowRouter.getParam("userId"), tab: "userInfo"});
            } else {
              alert(error.reason);
            }
          }
        );
      } else {
        alert("请填写姓名，并且姓名需要少于10个字");
      }
    }
  }
);
