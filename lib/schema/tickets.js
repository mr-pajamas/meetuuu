Tickets = new Mongo.Collection('tickets');

// Global
var Schemas = {};

// 票务时间
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

// 票务重要参数
Schemas.mainArgs = new SimpleSchema({
  people: {
    type: Number,
    label: '人数'
  },
  price: {
    type: Number,
    label: '价格'
  },
  minBuy: {
    type: Number,
    label: '至少购买几份',
    min: 1
  //  TODO 默认为 1 份
  },
  maxBuy: {
    type: Number,
    label: '最多购买几份',
    min: 1
  }
});


Schemas.ticket = new SimpleSchema({
  activity: {
    type: Mongo.ObjectID,
    label: '所属活动'
  },
  name: {
    type: String,
    label: '票务名称'
  },
  desc: {
    type: String,
    label: '票务说明',
    min: 10
  },
  isFree: {
    type: Boolean,
    label: '是否收费'
  },
  mainArgs: {
    type: Schemas.mainArgs,
    label: '票务详情'
  },
  total: {
    type: Number,
    label: '数量',
    min: 0,
    //  TODO 不限制为 0
  },
  status: {
    type: Number,
    label: '票务状态' // 未售，正售，售罄
  },
  review: {
    type: Boolean,
    label: '是否需要审核'
    //  TODO 默认不用审核，自由报名参加
  },
  accessTime: {
    type: Schemas.time,
    label: '可预订时间'
    //  TODO 默认为活动结束前的事件
  },
  validTime: {
    type: Schemas.time,
    label: '有效时间'
    // TODO 默认为活动期间
  }
});