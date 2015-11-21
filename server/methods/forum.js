/**
 * Created by jym on 2015/11/9.
 */

Meteor.methods({
  //updateId: updateId, groupPath: groupPath
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
    var content = post.content;
    var imgPath = post.imgPath;
    var url ;
    var discId;
    discId = Discussion.insert(post);

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
  }
})

function ImgFindDiff(imgpath, postImg) {
  return _.difference(imgpath, postImg);
}
