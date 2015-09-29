Template.eventComment.onRendered(function() {
  var self = this,
      eid = FlowRouter.getParam('eid');

  self.autorun(function() {
    // 订阅活动评论
    self.subscribe('eventComments', eid);
  });
});


Template.eventComment.helpers({
  'replys': function() {
    var eid = FlowRouter.getParam('eid');
    var replys = EventComments.find({'eventId': eid}, {'sort': {'createAt': -1}});
    var fc = replys.map(function(reply) {
      // 更新留言时间
      reply.createAt = moment(reply.createAt).fromNow();
      // 更新子评论时间
      if (reply.comments && reply.comments.length > 0) {
        reply.comments = reply.comments.map(function(comment) {
          comment.createAt = moment(comment.createAt).fromNow();
          return comment;
        });
      }
      return reply;
    });
    return fc;
  }
});



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
        $(window).scroll();
      }
    });
  },
  // 取消留言评论
  'click .cancelReply': function(e) {
    e.preventDefault();
    var cid = $(e.target).attr('data-id');
    $('#replyComment-' + cid).slideUp({
      done: function () {
        $(window).scroll();
      }
    });
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
