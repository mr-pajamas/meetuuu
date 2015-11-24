/**
 * Created by jianyanmin on 15/10/7.
 */
/*function forumEditAuth(option){
 check(option, Match.ObjectIncluding({
 userId: String,
 authName: Array,
 groupId: String
 }));
 var userId = option.userId;
 var authName = option.authName;
 var groupId = option.groupId;
 var membership = Memberships.findOne({userId: userId, groupId: groupId});
 if(membership && membership.role === "owner") {
 return true;
 } else if(Roles.userIsInRole(userId, authName, 'g'+ groupId)) {
 return true;
 }  else return false;
 };*/

var PAGE_SIZE = 10;
var limit;
var setPageTime;
Template.forumDiscussionItem.onCreated(function () {
  setPageTime = new Date();
  limit = new ReactiveVar(PAGE_SIZE);
  var template = this;
  template.autorun(function () {
    template.subscribe('commentItemBefore', FlowRouter.getParam("discId"), parseInt(limit.get() + 1), setPageTime);
  });
  template.subscribe('commentItemAfter', FlowRouter.getParam("discId"), setPageTime);
  template.subscribe("MyCollectionData", FlowRouter.getParam("discId"), Meteor.userId());
  //console.log(this)
  Discussion.update({_id: FlowRouter.getParam("discId")}, {$inc: {viewCount: 1}})
});
Template.forumDiscussionItem.helpers({
  authManage: function() {
    //获得用户ID
    var userId = Meteor.userId();
    //获得用户path
    var path = FlowRouter.getParam("groupPath");
    var group = Groups.findOne(path);
    var authStatus;
    //console.log("分组表"+groupId._id);
    var  groupId = group._id;
    var option = {userId : userId, authName:['modify-own-topic', 'remove-own-topic', 'pin-topic', 'close-own-topic'] , groupId: groupId};
    //console.log(option);
    authStatus = forumAuth(option);
    // console.log(authStatus);
    return authStatus &&{}|| "hidden";
  },
  authEdit: function(){
    //获得用户ID
    var userId = Meteor.userId();
    //获得用户path
    var path = FlowRouter.getParam("groupPath");
    var group = Groups.findOne(path);
    var authStatus;
    //console.log("分组表"+groupId._id);
    var  groupId = group._id;
    var option = {userId : userId, authName:['modify-topic', 'modify-own-topic'] , groupId: groupId};
    //console.log(option);
    authStatus = forumAuth(option);
    // console.log(authStatus);
    return authStatus &&{}|| "hidden";
    /* var membership = Memberships.findOne({userId: userId, groupId: groupId});
     if(membership && membership.role === "owner") {
     return {};
     } else if(Roles.userIsInRole(userId, ['modify-topic'], 'g'+ groupId)) {
     return {};
     } else {
     if(Roles.userIsInRole(userId, ['modify-own-topic'], 'g'+ groupId)) {
     return {};
     } else return "hidden";
     }*/
  },
  authDelete: function() {
    //获得用户ID
    var userId = Meteor.userId();
    //获得用户path
    var path = FlowRouter.getParam("groupPath");
    var group = Groups.findOne(path);
    //console.log("分组表"+groupId._id);
    var  groupId = group._id;
    var authStatus;
    //console.log("分组表"+groupId._id);
    var  groupId = group._id;
    var option = {userId : userId, authName:['remove-topic', 'remove-own-topic'] , groupId: groupId};
    console.log(option);
    authStatus = forumAuth(option);
    console.log(authStatus);
    return authStatus &&{}|| "hidden";
    /* var membership = Memberships.findOne({userId: userId, groupId: groupId});
     if(membership && membership.role === "owner") {
     return {};
     } else if(Roles.userIsInRole(userId, ['remove-topic'], 'g'+ groupId)) {
     return {};
     } else {
     if(Roles.userIsInRole(userId, ['remove-own-topic'], 'g'+ groupId)) {
     return {};
     } else return "hidden";
     }*/
  },
  authSetTop: function() {
    //获得用户ID
    var userId = Meteor.userId();
    //获得用户path
    var path = FlowRouter.getParam("groupPath");
    var group = Groups.findOne(path);
    //console.log("分组表"+groupId._id);
    var  groupId = group._id;
    var authStatus;
    //console.log("分组表"+groupId._id);
    var  groupId = group._id;
    var option = {userId : userId, authName:['pin-topic'] , groupId: groupId};
    console.log(option);
    authStatus = forumAuth(option);
    console.log(authStatus);
    return authStatus &&{}|| "hidden";
  },
  authClose: function() {
    var userId = Meteor.userId();
    //获得用户path
    var path = FlowRouter.getParam("groupPath");
    var group = Groups.findOne(path);
    //console.log("分组表"+groupId._id);
    var  groupId = group._id;
    var authStatus;
    //console.log("分组表"+groupId._id);
    var  groupId = group._id;
    var option = {userId : userId, authName:['close-own-topic'] , groupId: groupId};
    console.log(option);
    authStatus = forumAuth(option);
    console.log(authStatus);
    return authStatus &&{}|| "hidden";
  },
  groupPath: function () {
    return FlowRouter.getParam("groupPath");
  },
  flagStatus: function () {
    return (FlowRouter.getQueryParam("flag") === "1" && FlowRouter.getQueryParam("flag") != null);
  },
  firstImg: function() {
    var imgPathStr=[];
    if(this.imgPath!="" && this.imgPath !=null){
      imgPathStr = this.imgPath;
    }
    return imgPathStr[0];
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
    if (this.content.indexOf('<img') >= 0) {
      return (this.content.substring(0, this.content.indexOf('<img'))).replace(/<[^>]+>/g, "").substring(0, 150);
    }
    else {
      return this.content.replace(/<[^>]+>/g, "").substring(0, 150);
    }
  },
  existMyCollection: function() {
    return MyCollection.findOne();
  },
  existUserData: function () {
    var updateId = FlowRouter.getParam("discId");
    var disc = Discussion.findOne({_id: updateId});
    console.log("csd:" + disc.upVote);
    if (_.include(disc.upVote, Meteor.user()._id)) {
      return true;
    } else {
      return false;
    }
  },
  existData: function () {
    if (Comments.find().count() > 0)
      return true;
    else return false;
  },
  commentItemsBefore: function () {
    //,limit: parseInt(FlowRouter.getQueryParam("limitNum"))+1
    return Comments.find({
      discussionId: FlowRouter.getParam("discId"),
      createdAt: {$lte: setPageTime}
    }, {sort: {createdAt: -1}, limit: limit.get()}).fetch().reverse();
  },
  commentItemsAfter: function () {
    return Comments.find({createdAt: {$gt: setPageTime}}, {sort: {createdAt: 1}});
  },
  canModify: function () {
    return this.userId == Meteor.userId()
  },
  discussionCount: function () {
    var count = Comments.find({createdAt: {$lte: setPageTime}}).count();
    return count == limit.get() + 1;
  },
  closeStatus: function() {
    console.log(this.closeStatus);
    return this.closeStatus;
  },
});

Template.forumDiscussionItem.events({
  "click .setTopBtn": function(e, template) {
    e.preventDefault();
    if (confirm("确定将该贴置顶")) {
      var updateId = template.data._id;
      Meteor.call("setTopForum", updateId, function(error, result) {
        if(result) alert("已置顶"); else{ alert("置顶失败")}
      });
      /* Discussion.update({_id:updateId},{$set:{setTop: 1}}, function (error, result) {
       console.log(result);
       });*/
    }
  },
  "click .closeBtn": function(e, template) {
    e.preventDefault();
    if (confirm("确定将该贴关闭，关闭后不可恢复")) {
      var updateId = template.data._id;
      Meteor.call("closeForum", updateId, function(error, result) {
        if(result) alert("已关闭"); else{ alert("关闭失败")}
      });
    }
  },
  "click .my-collection":function() {
    var insertData={discussionId: FlowRouter.getParam("discId"), userId: Meteor.userId()};
    console.log(insertData);
    MyCollection.insert(insertData, function(error, result){
      if(result){
        alert("收藏成功！");
        Discussion.update({_id: FlowRouter.getParam("discId") },{$inc:{collectionCount: 1} });
      }
    });
  },
  "click .delDisc": function (e, template) {
    if (confirm("是否要删除该讨论！")) {
      var updateId = FlowRouter.getParam("discId");
      var groupPath = FlowRouter.getParam("groupPath");
      var delDisc = {updateId: updateId, groupPath: groupPath};
      Meteor.call("deleteDiscussion",delDisc);
      /* Discussion.remove({_id: updateId});
       if(Comments.findOne({discussionId: updateId})){
       Meteor.call("deleteDiscussion",updateId);
       }*/
      FlowRouter.go("/groups/:groupPath/discussion",{groupPath: groupPath});
    }
  },
  "click .collapseBtn": function (e, template) {
    e.preventDefault();
    if (FlowRouter.getQueryParam("flag") == 1) {
      FlowRouter.setQueryParams({flag: 0});

      //console.log(FlowRouter.getQueryParam("flag"));
    } else {
      FlowRouter.setQueryParams({flag: 1});
    }
  },
  "click .upVote": function (e, params) {
    e.preventDefault();
    if (Meteor.user() != null) {
      if (confirm("确定要为该帖点赞吗")) {
        var updateId = this._id;
        var post = {
          discId: updateId,
          userId: Meteor.user()._id
        };
        Meteor.call("upVoteForum", post, function (error, result) {
          if (result.returnMsg.flag) {
            alert(result.returnMsg.message);
          } else {
            alert(result.returnMsg.message);
          }
        });
      }
    }
  },
  "click .load-more": function (e, template) {
    e.preventDefault();
    limit.set(limit.get() + PAGE_SIZE);
  }
});
