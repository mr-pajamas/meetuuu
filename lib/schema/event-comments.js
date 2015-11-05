CommentSchema = {};

EventComments = new Mongo.Collection('eventComments');


CommentSchema.user = new SimpleSchema({
  username: {
    type: String,
    label: '用户名',
    optional: true
  },
  uid: {
    type: String,
    label: '用户ID',
    optional: true
  }
});

CommentSchema.comment = new SimpleSchema({
  user: {
    type: CommentSchema.user,
    label: '评论的用户信息',
    optional: true,
  },
  cid: {
    type: String,
    label: '该评论的Id',
    optional: true
  },
  content: {
    type: String,
    label: '评论信息',
    optional: true,
  },
  createAt: {
    type: Date,
    label: '回复的时间',
    optional: true,
    autoValue: function() {
      if (this.isInsert || this.isUpdate) {
        return new Date;
      } else if (this.isUpsert) {
        return {$setOnInsert: new Date};
      } else {
        this.unset();
      }
    }
  }
});

CommentSchema.eventComments = new SimpleSchema({
  commentType: {
    type: String,
    // event 针对活动, comment 针对评论, 这些评论留存，但不会单独显示
    allowedValues: ['event', 'comment'],
    label: '评论类型'
  },
  eventId: {
    type: String,
    label: '所属活动',
    index: true
  },
  // 如果是回复一条 评论，则该字段存在
  commentId: {
    type: String,
    label: '被回复的评论',
    optional: true
  },
  comments: {
    type: [CommentSchema.comment],
    label: '评论的子评论',
    optional: true,
    minCount: 0
  },
  content: {
    type: String,
    label: '评论内容'
  },
  commentBy: {
    type: CommentSchema.user,
    label: '评论者信息'
  },
  createAt: {
    type: Date,
    label: '创建时间',
    optional: true,
    autoValue: function() {
      if (this.isInsert) {
        return new Date;
      } else if (this.isUpsert) {
        return {$setOnInsert: new Date};
      } else {
        this.unset();
      }
    }
  }
});

EventComments.attachSchema(CommentSchema.eventComments);
