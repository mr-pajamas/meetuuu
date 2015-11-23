/**
 * Created by jym on 2015/11/9.
 */

Meteor.methods({
  //帖子管理
  deleteDiscussion: function(delDisc){
    check(delDisc.updateId, String);
    check(delDisc.groupPath, String);
    var updateId = delDisc.updateId;
    console.log(updateId);
    var groupPath = delDisc.groupPath;
    var disc = Discussion.findOne({_id: updateId});
    var imgPathArray = disc.imgPath ;
    //console.log(imgPathArray);
    if(imgPathArray){
      for(var i=0; i<imgPathArray.length; i++){
        Meteor.defer(function(i){
          return function(){
            //console.log(imgPathArray[i]);
            ObjectStore.removeByUrl(imgPathArray[i]);
          }
        }(i));
      }
    }
    Discussion.remove({_id: updateId});
    if(Comments.findOne({discussionId: updateId})) {
      Comments.remove({discussionId: groupPath});
    }
  },
  insertForum: function(post){
    var insertData = {
      subject: post.subject,
      content: post.content,
      imgPath: post.imgPath,
      groupId: post.groupId,
      userId: post.userId,
      userName: post.userName,
      commentCount: post.commentCount,
      upVoteCount: post.upVoteCount
    };

    var authData = {
      userId: post.userId,
      groupId: post.groupId,
      authName: post.authName
    };
    var content = post.content;
    var imgPath = post.imgPath;
    var url ;
    var discId;
    //插入数据权限认证
    if(forumCreateAuth(authData)) {
      discId = Discussion.insert(insertData);
      for(var i=0; i<imgPath.length; i++)
      {
        Meteor.defer(function (i) {
          return function(){
            // console.log(post.imgPath[i]);
            url = ObjectStore.putDataUri(imgPath[i]);
            // console.log(url);
            if (url && discId) {
              var restring="/images/default-poster.png?i="+i;
              //console.log(restring);
              // content = content.replace(new RegExp("("+restring+")", "g"), url);
              content = content.replace(""+restring, url);
              // console.log(content);
              imgPath[i] = url;
              Discussion.update({_id: discId}, {
                $set: {
                  content: content,
                  imgPath: imgPath
                }
              });
            }
          }
        }(i))
      }
    }
    return discId;
  },
  updateForum: function(post){
    var subject = post.subject;
    var content = post.content;
    var imgPath = post.imgPath;
    var url ;
    var discId = post.DiscId;
    var discIdUpdate =discId;
    var discImg = Discussion.findOne({_id: discIdUpdate});
    //先取出数据库数据
    var imgPathArray = discImg.imgPath;
    //更新数据库数据
    discId = Discussion.update({_id: discId},{$set:{
      subject:subject,
      content: content,
      imgPath: imgPath
    }});
    for(var i=0; i<imgPath.length; i++)
    {
      if((new RegExp(/^data:/)).test(imgPath[i])){
        //console.log("需要上传");
        Meteor.defer(function (i) {
          return function(){
            //console.log(post.imgPath[i]);
            url = ObjectStore.putDataUri(imgPath[i]);
            //console.log(url);
            if (url && discId) {
              var restring="/images/default-poster.png?i="+i;
              // console.log(restring);
              // content = content.replace(new RegExp("("+restring+")", "g"), url);
              content = content.replace(""+restring, url);
              //console.log("替换后内容"+content);
              imgPath[i] = url;
              //console.log("图片存储"+imgPath[i]);
              var updateId = Discussion.update({_id: discIdUpdate}, {
                $set: {
                  content: content,
                  imgPath: imgPath
                }
              });
              //console.log(updateId+"讨论ID"+discIdUpdate);
            }

          }
        }(i))
      }
      /* else {
       console.log("不需要上传");
       var restring="/images/default-poster.png?i="+i;
       console.log(restring);
       // content = content.replace(new RegExp("("+restring+")", "g"), url);
       content = content.replace(""+restring, imgPath[i]);
       Discussion.update({_id: discId}, {
       $set: {
       content: content
       }
       });
       }*/

    }
    //console.log("替换前imgpath"+ imgPathArray);
    //console.log("传入img path"+imgPath);
    var imgDiff = ImgFindDiff(imgPathArray, imgPath);
    //console.log("废弃图片"+imgDiff);
    if(imgDiff) {
      for(var j=0; j<imgDiff.length; j++) {
        Meteor.defer(function (j) {
          return function() {
            //console.log(imgDiff[j]);
            ObjectStore.removeByUrl(imgDiff[j]);
          }
        }(j));
      }
      return discId;
    }
  },
  setTopForum: function(post) {
   var postStatus = Discussion.update({_id: post},{$set:{setTop: 1}})
    return postStatus;
  },

  closeForum: function(post) {
     var postStatus = Discussion.update({_id: post},{$set:{closeStatus: 1}});
      return postStatus;
    },

  //评论管理



})

function ImgFindDiff(imgpath, postImg) {
  return _.difference(imgpath, postImg);
};
//创建帖子权限
function forumCreateAuth(option) {
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
};
