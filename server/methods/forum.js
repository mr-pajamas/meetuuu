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
          console.log(post.imgPath[i]);
                    url = ObjectStore.putDataUri(imgPath[i]);
                    console.log(url);
                    if (url && discId) {
                      var restring="/images/default-poster.png?i="+i;
                      console.log(restring);
                      content = content.replace(new RegExp("("+restring+")", "g"), url);
                      console.log(content);
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
    }
})
