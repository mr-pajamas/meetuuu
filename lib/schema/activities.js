Activities = new Mongo.Collection('activities');

// Global
var Schemas = {};


// 活动地址信息
Schemas.location = new SimpleSchema({
  city: {
    type: String,
    label: '城市名称'
  },
  address: {
    type: String,
    label: '活动地址'
  },
  lat: {
    type: Number,
    label: '纬度',
    optional: true
  },
  lng: {
    type: Number,
    label: '经度',
    optional: true
  }
});


// 活动时间信息
Schemas.time = new SimpleSchema({
  start: {
    type: Date,
    label: '开始时间'
  },
  end: {
    type: Date,
    label: '结束时间'
  },
  duration: {
    type: String,
    label: '活动时长'
  //  TODO calculate by [ end - start ]
  }
});


// 活动 Tag
Schemas.tag = new SimpleSchema({
  name: {
    type: String,
    label: '标签名字'
  },
  refers: {
    type: Number,
    min: 1,
    label: '引用次数'
  }
});



Schemas.Activities = new SimpleSchema({
  title: {
    type: String,
    label: '名称',
    min: 5
  },
  location: {
    type: Schemas.location,
    label: '活动地址信息'
  },
  time: {
    type: Schemas.time,
    label: '活动时间信息'
  },
  poster: {
    type: String, // 七牛key
    label: '海报',
    optional: true
  },
  member: {
    type: Number,
    label: '活动参与人数',
    min: 0,
    optional: true // 0 无限制
    // TODO 缺省时，自动补全为 0
  },
  theme: {
    type: String,
    label: '活动主题'
  },
  tags: {
    type: [Schemas.tag],
    label: '标签描述',
    min: 2
  },
  private: {
    type: Boolean,
    label: '是否公开',
  //  TODO 缺省时为 false，即公开
  },
  desc: {
    type: String,
    label: '活动描述',
    min: 10
  }
});



Activities.attachSchema(Schemas.Activities);