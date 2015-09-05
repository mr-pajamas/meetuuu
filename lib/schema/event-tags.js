EventTag = new Mongo.Collection('eventTag');

// Global
var Schemas = {};

// 票务时间
Schemas.tag = new SimpleSchema({
  name: {
    type: String,
    label: '名称'
  },
  refers: {
    type: Number,
    label: '引用次数'
  }
});

EventTag.attachSchema(Schemas.tag);