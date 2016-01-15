/**
 * Created by jym on 2016/1/13.
 */

/**
 * Created by jianyanmin on 16/1/9.
 */

/**
 * Created by jym on 2016/1/4.
 */
Template.manageGroupsItem.helpers({
  createTime: function() {
     var createTime = moment(this.foundedDate).format('M月D日 HH:mm');
    return createTime;
  }
})

Template.manageGroupsItem.events({
  "click .updateBtn": function(e, template) {
    Session.set("usersCollData",{});
    // alert(this._id);
    var groupCollData = Groups.findOne(this._id);
    Session.set("groupCollData",groupCollData);
    $(".updateModal").click();
  },
  "click .deleteBtn": function(e, template) {
    //alert(this._id)
    if(confirm("确定删除该信息")) {
      Meteor.call("deleteMangeGroup", this._id, function(error, result) {
        if(result) {
          alert("删除成功");
        } else {
          alert("删除失败");
        }
      })
    }
  }
})
