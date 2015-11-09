/**
 * Created by jym on 2015/11/9.
 */

Meteor.methods({
  deleteDiscussion: function(delDisc){
    check(delDisc, String);
    Comments.remove({discussionId: delDisc});
  }
})
