Meteor.methods({
  'submitEventComment': function(comment) {
    check(comment, CommentSchema.eventComments);
    var id;
    // 保存评论
    console.log(comment);
    id = EventComments.insert(comment);
    // 如果是回复评论，将嵌入到评论
    if (comment.commentType === 'comment') {
      var commentId = comment.commentId;
      var childComent = {
        cid: id,
        content: comment.content,
        user: comment.commentBy
      };
      // 返回评论的个数
      var cnt = EventComments.update({'_id': commentId}, {'$addToSet': {comments: childComent}});
      return {'code': id && cnt === 1 ? 0 : -1, res: id};
    } else {
      return {'code': id ? 0 : -1, res: id};
    }
  },
  'deleteComment': function(tid) {
    check(tid, String);
    if (EventComments.findOne({'_id': tid}).commentBy.uid !== Meteor.userId()) {
      EventComments.remove({'_id': tid});
    }
  }
})
