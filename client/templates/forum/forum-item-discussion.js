/**
 * Created by jym on 2015/10/8.
 */

Template.forumItemDiscussion.onRendered( function () {

})
Template.forumItemDiscussion.helpers({
  alreadyVote: function () {
    var updateId = this._id;
    var disc = Discussion.findOne({_id: updateId});
    return _.include(disc.upVote, Meteor.user()._id);
  },
  showTime: function () {
    var nowTime = moment();
    var createAt = this.createdAt;
    var diff = moment.duration(nowTime.diff(createAt)).asSeconds();
    var diffh = moment.duration(nowTime.diff(createAt)).asHours();
    if(parseInt(diff)<60){
      return "刚刚";
    }
    if (parseInt(diffh)<12)
    {
      return moment(createAt).fromNow().toString();
    }
    else{
      return moment(createAt).format("YYYY-MM-DD HH:mm:ss");
    }

  },
  setTopCss: function () {
    if (this.setTop==1) {
      console.log(this.imgPath);
      return true;
    } else {
      return false;
    }
  },
  imgPathStr: function(){
    var imgPathStr=[];
    if(this.imgPath!="" && this.imgPath !=null){
      imgPathStr = this.imgPath;
      imgPathStr = imgPathStr.slice(0,4);
    }
    return imgPathStr || {};
  },
  contentFormate: function () {
    if(this.content.indexOf('<img')>=0)
    {
      return  (this.content.substring(0, this.content.indexOf('<img'))).replace(/<[^>]+>/g,"").substring(0,150) ;
    }
    else
    {
      return this.content.replace(/<[^>]+>/g,"").substring(0,150) ;
    }
  },
  flagStatus: function () {
    return (FlowRouter.getQueryParam("flag") === "1" && FlowRouter.getQueryParam("flag") != null);
  },
  authSetTop: function(){
    var userId = Meteor.userId();
    //获得用户path
    var path = FlowRouter.getParam("groupPath");
    var group = Groups.findOne(path);
    //console.log("分组表"+groupId._id);
    var  groupId = group._id;
    var option = {userId : userId, authName: ['pin-topic'] , groupId: groupId};
    var authStatus;
    authStatus = forumAuth(option);
    return authStatus && {} || "disabled";
    /* var membership = Memberships.findOne({userId: userId, groupId: groupId});
     if(membership && membership.role === "owner") {
     return {};
     } else if(Roles.userIsInRole(userId, ['pin-topic'], 'g'+ groupId)) {
     return {};
     }  else return "disabled";*/
  },
  authDel:function() {
    var userId = Meteor.userId();
    //获得用户path
    var path = FlowRouter.getParam("groupPath");
    var group = Groups.findOne(path);
    //console.log("分组表"+groupId._id);
    var  groupId = group._id;
    var option = {userId : userId, authName: ['remove-own-topic'] , groupId: groupId};
    var authStatus;
    authStatus = forumAuth(option);
    return authStatus && {} || "disabled";
    /*var membership = Memberships.findOne({userId: userId, groupId: groupId});
     if(membership && membership.role === "owner") {
     return {};
     } else if(Roles.userIsInRole(userId, ['remove-own-topic'], 'g'+ groupId)) {
     return {};
     }  else return "disabled";*/
  }
});

Template.forumItemDiscussion.events({
  "click a.upVote": function(e, template) {
    e.preventDefault();
    if (Meteor.user() != null) {
      if (confirm("UpVote  this Discussion?")) {
        var updateId = this._id;
        var disc = Discussion.findOne({_id: updateId});
        if (!disc) {
          throw new Meteor.Error('invalid', 'Discussion not found');
        }
        if (_.include(disc.upVote, Meteor.user()._id)) {
          throw new Meteor.Error('invalid', 'User is exist');
        }
        else {
          Discussion.update(disc._id, {
            $addToSet: {upVote: Meteor.user()._id},
            $inc: {upVoteCount: 1}
          }, function (error, result) {
          });
        }
      }

    } else {
      alert("请先登录");
      FlowRouter.go("join");
    }
  },
  "click .delBtn": function(e, template) {
    var groupPath = FlowRouter.getParam("groupPath");
    if (confirm("确定将该贴删除")) {
      var updateId = template.data._id;
      Discussion.remove({_id: updateId});
      if (Comments.findOne({discussionId: updateId})) {
        Meteor.call("deleteDiscussion", updateId);
      }
      FlowRouter.go("/groups/:groupPath/discussion", {groupPath: groupPath});
    }
  },
  "click .setTopBtn": function(e, template) {
    e.preventDefault();
    if (confirm("确定将该贴置顶")) {
      var updateId = template.data._id;
      Discussion.update({_id:updateId},{$set:{setTop: 1}}, function (error, result) {
        console.log(result);
      });
    }
  }
});
