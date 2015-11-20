/**
 * Created by jym on 2015/11/9.
 */

Meteor.methods({
  deleteDiscussion: function(delDisc){
    check(delDisc, String);
    Comments.remove({discussionId: delDisc});
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
      } else {
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
      }

    }
    return discId;
  }
})
