Template.eventComment.events({
  // 删除评论
  'click .deleteComment': function(e) {
    e.preventDefault();
    var cid = $(e.target).attr('data-id');
    Meteor.call('deleteComment', cid);
  },
  // 给留言写评论
  'click .replyComment' : function(e, template) {
    e.preventDefault();
    var cid = $(e.target).attr('data-id');
    $('#replyContainer-' + cid).hide();
    $('#replyComment-' + cid).slideDown({
      done: function () {
        template.find('textarea').focus();
      }
    });
  },
  // 取消留言评论
  'click .cancelReply': function(e) {
    e.preventDefault();
    var cid = $(e.target).attr('data-id');
    $('#replyComment-' + cid).slideUp();
    $('#replyContainer-' + cid).show();
  },
  // 提交对留言的评论
  'click .submitCommentReply': function(e, template) {
    e.preventDefault();
    var cid = this._id;
    var replyComment = template.$('textarea').val();
    var comment = {
      commentType: 'comment',
      eventId: this.eventId,
      content: replyComment,
      commentId: cid,
      // TODO 用户信息
      commentBy: {
        username: 'ck',
        uid: 'abckdefsfs'
      }
    };
    Meteor.call('submitEventComment', comment, function(err, res) {
      if (!err && res.code === 0) {
        alert('评论成功');
        // 显示回复按钮
        $('#replyContainer-' + cid).show();
        // 清楚评论并收起评论框
        $('#replyComment-' + cid).slideUp().find('textarea').val('');
      }
    });
  }
});