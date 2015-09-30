JoinForm = new Mongo.Collection('joinForm');

var schema = {};


schema.joinForm = new SimpleSchema({
  eventId: {
    label: '活动Id',
    type: String,
    index: true
  },
  userId: {
    label: '用户ID',
    type: String,
    index: true
  },
  cname: {
    label: '报名者的真实姓名',
    type: String
  },
  telephone: {
    label: '电话',
    type: String
  },
  signForm: {
    label: '报名表单',
    type: [Object],
    optional: true,
    blackbox: true
  },
  status: {
    label: '报名状态',
    type: String,
    allowedValues: [
      'request', 'accept', 'refuse', 'banned'
    ]
  },
  createTime: {
    label: '报名时间',
    type: Date
  },
  denyResult: {
    label: '拒绝参加理由',
    type: String,
    optional: true
  }
});

JoinForm.attachSchema(schema.joinForm);