var schema = {};

EventComments = new Mongo.Collection('eventComments');


schema.user = new SimpleSchema({
  username: {
    type: String,
    label: '用户名'
  },
  uid: {
    type: String,
    label: '用户ID'
  }
});

schema.targetContent = new SimpleSchema({
  // 只需要填写 targetId 这一个字段，其余由代码自动补全
  targetId: {
    type: String,
    label: '针对的评论'
  },
  commentUser: {
    type: schema.user,
    label: '被评论的评论者',
    optional: true,
    autoValue: function() {
      return EventComments.findOne({'_id': this.field('targetId')}).commentBy;
    }
  },
  contents: {
    // 将级联评论一次放入数组
    type: [String],
    optional: true,
    minCount: 1,
    label: '级联评论',
    // 自动提取信息  将当前的针对的评论 放入它的 contents 字段里
    autoValue: function() {
      var target = EventComments.findOne({'_id': this.field('targetId')}),
          comments = [];
      if (target && target.targetContent) {
        comments = target.targetContent.contents;
      }
      comments.push(target.content);
      return comments;
    }
  }
});

schema.eventComments = new SimpleSchema({
  commentType: {
    type: String,
    // event 针对活动, comment 针对评论
    allowedValues: ['event', 'comment'],
    label: '评论类型'
  },
  eventId: {
    type: String,
    label: '所属活动',
    index: true
  },
  // 如果是回复一条 评论，则该字段存在
  targetContent: {
    type: schema.targetContent,
    label: '级联评论',
    optional: true
  },
  content: {
    type: String,
    label: '评论内容'
  },
  commentBy: {
    type: schema.user,
    label: '评论者信息'
  },
  createAt: {
    type: Date,
    label: '创建时间',
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

EventComments.attachSchema(schema.eventComments);