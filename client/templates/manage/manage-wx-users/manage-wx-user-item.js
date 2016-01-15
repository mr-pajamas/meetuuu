/**
 * Created by jym on 2016/1/15.
 */
/**
 * Created by jym on 2016/1/4.
 */
Template.manageWXUserItem.helpers({
  asd: function() {

    return  Session.get("asd");
  }
})

Template.manageUserItem.events({
  "click .updateBtn": function(e, template) {
    Session.set("usersCollData",{});
    // alert(this._id);
    var usersCollData = Meteor.users.findOne(this._id);
    Session.set("usersCollData",usersCollData);
    $(".updateModal").click();
  },
  "click .deleteBtn": function(e, template) {
    //alert(this._id)
    if(confirm("确定删除该信息")) {
      Meteor.call("deleteMangeUser", this._id, function(error, result) {
        if(result) {
          alert("删除成功");
        } else {
          alert("删除失败");
        }
      })
    }
  }
})
