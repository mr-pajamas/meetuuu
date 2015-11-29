/**
 * Created by jym on 2015/11/23.
 */

/*
Meteor.methods({
  //帖子权限
  forumAuth: function(option) {
    check(option, Match.ObjectIncluding({
      userId: String,
      authName: Array,
      groupId: String
      //var option = {userId : userId, authName:['create-topic'] , groupId: groupId};
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
  },
  //创建帖子
  forumCreateAuth: function(option){
    check(option, Match.ObjectIncluding({
      userId: String,
      authName: Array,
      groupId: String
      //var option = {userId : userId, authName:['create-topic'] , groupId: groupId};
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
  },
  //编辑帖子
  forumEditAuth: function(option){

  },
  //删除帖子
  forumDelete: function(option){

  },
  //置顶帖
  forumSetTop: function(option){

  },
  //关闭帖子
  forumCloseStatus: function(option){

  },
});
*/
/*forumAuthFunction = ( function(){
   forumAuth ={
    forumCreateAuth: function(option){
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
    }
  };

})*/
forumAuth = function (option) {
  if(option.userId==null || option.authName == null || option.groupId == null){
    return false;
  }
  check(option, Match.ObjectIncluding({
   userId: Match.Optional(String),
   authName: Match.Optional(Array),
   groupId: Match.Optional(String)
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
 };

/*
 //编辑帖子
 function forumEditAuth(option){

 };
 //删除帖子
 function  forumDelete(option){

 };
 //置顶帖
 function forumSetTop(option){

 };
 //关闭帖子
 function  forumCloseStatus(option){

 };
 */


