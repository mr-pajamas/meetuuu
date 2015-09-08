EventTag = new Mongo.Collection('eventTag');

// Global
var Schemas = {};

// 票务时间
Schemas.tag = new SimpleSchema({
  name: {
    type: String,
    label: '名称',
    index: true,
    unique: true
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
  },
  refers: {
    type: Number,
    label: '引用次数'
  }
});

EventTag.attachSchema(Schemas.tag);

