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
var divData;
Session.set("testa","");
var commentFlag=0;
Template.forumDiscussionItem.onRendered(function() {
  var template = this;
  divData = template.$(".discussion-item-reply");
  template.autorun(function () {
    //Comments.find();
    console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    console.log(divData.scrollTop());
    console.log(divData.prop("scrollHeight"));
    console.log(commentFlag);
    console.log("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");
    Session.get("testa");
    if(divData.scrollTop()!=divData.prop("scrollHeight"))
    {
     // c.stop();
    }
    if (template.subscriptionsReady()) {

      Tracker.afterFlush(function () {
        // Comments.find();
        Meteor.setTimeout(function(){
          if(commentFlag==0){
          divData.scrollTop(divData.prop("scrollHeight"));
          Session.set("testa","");
          }
        },300)
      });

    }
  });
})
/* divData = this.$(".discussion-item-reply").scrollTop();
 divHe = this.$(".discussion-item-reply").prop('scrollHeight');
 if(Template.instance().beDate.ready() && Template.instance().afData.ready() && Template.instance().colData.ready() ){
 console.log(divData);
 console.log(divHe);
 }*/
//div.crollTop = div.prop('scrollHeight');
//this.$(".discussion-item-reply").scrollTop(300);
//this.$(".discussion-item-reply").scrollTop = 300;
//divData = this.$(".discussion-item-reply");
//var divTop = div.prop('scrollHeight');
//div.scrollTop = divTop;
//console.log(this.$(".discussion-item-reply").scrollTop());
//this.$(".discussion-item-reply").scrollTop=300;
//= this.$(".discussion-item-reply").prop('scrollHeight');
//console.log(div.scrollTop);
//console.log(this.$(".discussion-item-reply").prop('scrollHeight'));
//= this.$(".discussion-item-reply").scrollHeight
//});
Template.forumDiscussionItem.onCreated(function () {
  setPageTime = new Date();
  limit = new ReactiveVar(PAGE_SIZE);
  //var div = this.$(".discussion-item-reply");
  var template = this;
  template.autorun(function () {
    template.beDate = template.subscribe('commentItemBefore', FlowRouter.getParam("discId"), parseInt(limit.get() + 1), setPageTime);
    template.afData = template.subscribe('commentItemAfter', FlowRouter.getParam("discId"), setPageTime);
  });
  template.colData = template.subscribe("MyCollectionData", FlowRouter.getParam("discId"), Meteor.userId());
  //console.log(this)
  Discussion.update({_id: FlowRouter.getParam("discId")}, {$inc: {viewCount: 1}});
  var group = Template.currentData();
  //console.log("!!!!!");
  //console.log(group);
  template.subscribe("groupMembers", group.groupId);
});
Template.forumDiscussionItem.helpers({
  resultStatus: function() {
    /*  divData = this.$(".discussion-item-reply").scrollTop();
     divHe = this.$(".discussion-item-reply").prop('scrollHeight');*/
    if(Template.instance().beDate.ready() && Template.instance().afData.ready() && Template.instance().colData.ready() ){
      /* console.log(divData);
       console.log(divHe);*/
      //div.crollTop = div.prop('scrollHeight');
      return true;
    } return false;
  },
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
    //console.log(option);
    authStatus = forumAuth(option);
    //console.log(authStatus);
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
    //console.log(option);
    authStatus = forumAuth(option);
    //console.log(authStatus);
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
    //console.log(option);
    authStatus = forumAuth(option);
    //console.log(authStatus);
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
    if(disc && Meteor.userId()){
      if (_.include(disc.upVote, Meteor.user()._id)) {
        return true;
      } else {
        return false;
      }
    } else return false;

  },
  existData: function () {
    if (Comments.find().count() > 0)
      return true;
    else return false;
  },
  commentItemsBefore: function () {
    //,limit: parseInt(FlowRouter.getQueryParam("limitNum"))+1
    Session.set("testa","as");
    return Comments.find({
      discussionId: FlowRouter.getParam("discId"),
      createdAt: {$lte: setPageTime}
    }, {sort: {createdAt: -1}, limit: limit.get()}).fetch().reverse();
  },
  commentItemsAfter: function () {
    Session.set("testa","as");

    return Comments.find({createdAt: {$gt: setPageTime}}, {sort: {createdAt: 1}});
  },
  getDivHeight: function(){

  },
  canModify: function () {
    return this.userId == Meteor.userId()
  },
  discussionCount: function () {
    var count = Comments.find({createdAt: {$lte: setPageTime}}).count();
    return count == limit.get() + 1;
  },
  closeStatus: function() {
    //console.log(this.closeStatus);
    return this.closeStatus;
  },
  authComment: function() {
    //判断是不是该组成员
    var groupPath = FlowRouter.getParam("groupPath")
    //console.log(groupPath);
    var myGroup = MyGroups.findOne({path: groupPath});
    return myGroup;
  },
  errorMessage:function(field){
    var myContext = Comments.simpleSchema().namedContext("insertComment");
    return myContext.keyErrorMessage(field);
  }
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
    if(Meteor.user()){
      var insertData={discussionId: FlowRouter.getParam("discId"), userId: Meteor.userId()};
      Meteor.call("myCollection", insertData, function(error, result){
        if(result){
          alert("收藏成功！");
        } else {
          alert("收藏失败！");
        }
      });
    }  else {
      alert("请先登录");
      FlowRouter.go("signin");
    }


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
    else {
      alert("请先登录");
      FlowRouter.go("signin");
    }
  },
  "click .load-more": function (e, template) {
    e.preventDefault();
    limit.set(limit.get() + PAGE_SIZE);
  },
  "submit form" :function (e, params) {
    e.preventDefault();
    var comment = $(e.target).find('[name=comment]').val();
    var discussionId = params.data._id;
    var post ={comment:comment};
    //console.log(Meteor.userId());
    post= _.extend(post,{
      userId:Meteor.userId(),
      userName: Meteor.user().profile.name,
      discussionId: discussionId
    });
    /*var myContext = Comments.simpleSchema().namedContext("insertComment");
     console.log(post);
     console.log(myContext.valid(post));
     console.log(myContext.getErrorObject());*/
    /*if(myContext.validate(post)){*/
    Meteor.call("insertComment", post, function(error, result){
    });
    commentFlag=0;
    Session.set("testa","true");
    //}
    //console.log(myContext.validate(post));
    /*Comments.insert(post,{ validationContext: "insertComment"}, function(error, result) {
     if(result) {
     Discussion.update(discussionId,  {$inc: {commentCount: 1}, $set:{ lastReplyAt: new Date(), lastReplyUser: Meteor.user().profile.name, lastReplyUserId: Meteor.userId()}});
     }
     });*/
    $(e.target).find('[name=comment]').val("");
  },
  "mousewheel .discussion-item-reply": function(e, template) {
    commentFlag=1;

  },
  "DOMMouseScroll .discussion-item-reply": function() {
    commentFlag=1;
  },
  "focus .comment": function(e, template){
    template.$(".discussion-item-reply").scrollTop(template.$(".discussion-item-reply").prop("scrollHeight"));
  }
});
