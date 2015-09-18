Events = new Mongo.Collection('event');

// Global
var Schemas = {};


// 活动地址信息
Schemas.location = new SimpleSchema({
  city: {
    type: String,
    label: '城市名称',
    index: true
  },
  address: {
    type: String,
    label: '活动地址'
  },
  lat: {
    type: Number,
    decimal: true,
    label: '纬度',
    optional: true
  },
  lng: {
    type: Number,
    decimal: true,
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
    label: '活动时长',
    autoValue: function() {
      var start = moment(this.field("start")),
          end = moment(this.field("end")),
          span = end - start;
      if (typeof span === 'Number' && span) {
        return moment.duration(span).humanize();
      } else {
        return this.unset();
      }
    },
    optional: true,

  }
});


// 活动 Tag
Schemas.tag = new SimpleSchema({
  _id: {
    type: String,
    label: 'id'
  },
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



Schemas.Events = new SimpleSchema({
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
    min: 0, // 0 人数不受限
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
    label: '是否公开'
  },
  desc: {
    type: String,
    label: '活动描述',
    min: 10
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
  modifiedAt: {
    type: Date,
    label: '修改时间',
    autoValue: function() {
      if (this.isUpdate) {
        return new Date();
      }
    },
    denyInsert: true,
    optional: true
  },
  signForm: {
    type: [Object],
    label: '报名表单',
    blackbox: true
  }
});


Events.attachSchema(Schemas.Events);