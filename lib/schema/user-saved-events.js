UserSavedEvents = new Mongo.Collection('userSavedEvents');

// Global
var Schemas = {};

// 用户收藏活动的信息
Schemas.UserSavedEvents = new SimpleSchema({
  event: {
    type: Object,
    label: '活动信息'
  },
  'event.id': {
    type: Mongo.ObjectID,
    label: '活动id',
    index: 1
  },
  'event.name': {
    type: String,
    label: '活动名字'
  },
  user: {
    type: Object,
    label: '用户信息'
  },
  'user.name': {
    type: String,
    label: '用户姓名'
  },
  'user.id': {
    type: String,
    label: '用户id'
  }
});

UserSavedEvents.attachSchema(Schemas.UserSavedEvents);