/**
 * Created by jianyanmin on 16/1/9.
 */

/**
 * Created by jym on 2016/1/4.
 */
Template.manageEventsItem.helpers({
  createTime: function() {
    var createTime = {};
    if(this.time){
      createTime.start = moment(this.time.start).format('M月D日 HH:mm');
      createTime.end = moment(this.time.end).format('M月D日 HH:mm');
    }
    return createTime;
  }
})

Template.manageEventsItem.events({
  "click .updateBtn": function(e, template) {
    Session.set("usersCollData",{});
    // alert(this._id);
    var eventCollData = Events.findOne(this._id);
    Session.set("eventCollData",eventCollData);
    $(".updateModal").click();
  },
  "click .deleteBtn": function(e, template) {
    //alert(this._id)
    if(confirm("确定删除该信息")) {
      Meteor.call("deleteMangeEvent", this._id, function(error, result) {
        if(result) {
          alert("删除成功");
        } else {
          alert("删除失败");
        }
      })
    }
  }
})
