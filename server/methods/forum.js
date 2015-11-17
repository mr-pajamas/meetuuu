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
    var discId;
    Discussion.insert(post,function(error, result){
      discId = result;
    });
    for(var i=0; i<imgPath.length; i++){
      Meteor.defer(function(i){
        var url = ObjectStore.putDataUri(imgPath[i]);
        if(url && discId){
          content.replace("/images/default-poster.png?i="+i,url);
          imgPath[i] = url;
          Discussion.update({_id:discId},{$set:{content: content, imgPath: imgPath}});
        }
      })
    }
    }
})
