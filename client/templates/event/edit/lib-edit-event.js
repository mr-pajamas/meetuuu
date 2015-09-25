EditEvent = (function() {
  /**
   * event title
   */
  var eventTitle = {
    content: new ReactiveVar(''),
    inited: false,
    init: function(content) {
      this.content.set(content);
      this.inited = true;
    },
    setTitle: function(content) {
      this.content.set($.trim(content));
    },
    getTitle: function() {
      return this.content.get();
    },
    checkVilidation: function() {
      if (!this.content.get()) {
        console.log('活动标题尚未创建成功');
        return false
      }
      return true;
    }
  };


  /**
   * event time
   */
  var eventTime = {
    startOptions    : new ReactiveVar([]),
    endOptions      : new ReactiveVar([]),
    inited          : false,
    minuteInOneDay  : 24 * 60,
    startDateInISO  : null,
    endDateInISO    : null,
    startDate       : new ReactiveVar(),
    startTime_sec   : new ReactiveVar(0),
    endDate         : new ReactiveVar(),
    endTime_sec     : new ReactiveVar(0),
    init: function(startDOMId, endDomId, startISOTime, endISOTime, stepByMinute) {
      stepByMinute = stepByMinute || 30;
      if (stepByMinute < 0 || stepByMinute > 60) {
        throw Meteor.Error('时间跨度在[0, 60]间');
        return;
      }
      if (0 !== this.minuteInOneDay % stepByMinute) {
        throw Meteor.Error('时间跨度应该能够被 24*60整除');
        return;
      }

      this.startDate.set(moment(startISOTime).startOf('day'));
      this.endDate.set(moment(endISOTime).startOf('day'));
      this.startTime_sec.set(60 * (moment(startISOTime).get('hour') * 60 + moment(startISOTime).get('minute')));
      this.endTime_sec.set(60 * (moment(endISOTime).get('hour') * 60 + moment(endISOTime).get('minute')));
      this.startDateInISO = startISOTime;
      this.endDateInISO = endISOTime;
      this._initDatePicker(startDOMId, endDomId);
      this.setOptions(startISOTime, endISOTime, stepByMinute);
      this.inited = true;
    },
    _initDatePicker: function(startDomId, endDomId) {
      var datepickerOptions = {
        format: "yyyy/mm/dd",
        clearBtn: true,
        language: "zh-CN",
        todayHighlight: true
      };
      var self = this,
          $startDatePickerDom = $('#' + startDomId),
          $endDatePickerDom = $('#' + endDomId);
      $startDatePickerDom.datepicker(datepickerOptions)
        .on('changeDate', function(e) {
          var startDate = $startDatePickerDom.datepicker('getDate');
          self.setStartDate(startDate);
          self.setStartDateInISO();
        });
      $endDatePickerDom.datepicker(datepickerOptions)
        .on('changeDate', function(e) {
          var endDate = $endDatePickerDom.datepicker('getDate');
          self.setEndDate(endDate);
          self.setEndDateInISO();
        });
    },
    setOptions: function(startISOTime, endISOTime, stepByMinute) {
      var loopCount = this.minuteInOneDay / stepByMinute;
      var index,
          startOptions = [],
          endOptions = [];
      var start_ms = moment(startISOTime).get('hour') * 60 + moment(startISOTime).get('minute'),
          end_ms = moment(endISOTime).get('hour') * 60 + moment(endISOTime).get('minute');
      for (index = 0; index < loopCount; index++) {
        var currentMinutes = stepByMinute * (index + 1),
            hourNum = Math.floor(currentMinutes / 60),
            hourStr = hourNum < 10 ? '0' + hourNum : hourNum.toString(),
            minuteNum = currentMinutes - hourNum * 60,
            minuteStr = minuteNum < 10 ? '0' + minuteNum.toString() : minuteNum.toString(),
            content = hourStr + ':' + minuteStr,
            startAttr = {index: index},
            endAttr = {index: index};

        start_ms === currentMinutes ? startAttr.selected = true : false,
        end_ms === currentMinutes ? endAttr.selected = true : false;

        startOptions.push({
          attr: startAttr,
          value_sec: currentMinutes * 60,
          content: content,
        });
        endOptions.push({
          attr: endAttr,
          value_sec: currentMinutes * 60,
          content: content
        });
      }
      this.startOptions.set(startOptions);
      this.endOptions.set(endOptions);
    },
    getStartOptions: function() {
      return this.startOptions.get();
    },
    getEndOptions: function() {
      return this.endOptions.get();
    },
    // input: '17:30', return second
    timeTrans: function timeTrans(tstr) {
      var tt = tstr.split(':'),
          h = Number(tt[0]),
          m = Number(tt[1]),
          totalMinute = h * 60 + m,
          totalSecond = totalMinute * 60;
      return totalSecond;
    },
    setStartTime: function(time_str) {
      this.startTime_sec.set(this.timeTrans(time_str));
      this.setStartDateInISO();
    },
    setEndTime: function(time_str) {
      this.endTime_sec.set(this.timeTrans(time_str));
      this.setEndDateInISO();
    },
    getStartTime: function() {
      return this.startTime_sec.get();
    },
    getEndTime: function() {
      return this.endTime_sec.get();
    },
    setStartDate: function(startDate) {
      this.startDate.set(startDate);
    },
    getStartDateInUnix: function() {
      return this.startDate.get();
    },
    setEndDate: function(endDate) {
      this.endDate.set(endDate);
    },
    getEndDateInUnix: function() {
      return this.endDate.get();
    },
    setStartDateInISO: function() {
      this.startDateInISO = new Date((moment(this.startDate.get()).unix()+ this.getStartTime()) * 1000);
    },
    setEndDateInISO: function() {
      this.endDateInISO = new Date((moment(this.endDate.get()).unix()+ this.getEndTime()) * 1000);
    },
    getStartDateInISO: function() {
      return this.startDateInISO;
    },
    getEndDateInISO: function() {
      return this.endDateInISO;
    },
    checkValidation: function() {
      if (!this.inited) {
        console.log('活动日期尚未初始化');
        return false;
      }
      if (!this.startDateInISO) {
        console.log('活动开始日期没有设置');
        return false;
      }
      if (!this.endDateInISO) {
        console.log('活动结束日期没有设置');
        return false;
      }
      if (moment(this.startDateInISO) > moment(this.endDateInISO)) {
        console.log('活动开始时间晚于活动结束时间');
        return false;
      }
      return true;
    },
  };


  /**
   * 活动城市及地址选择
   */
  var eventLocation = {
    cityOptions: new ReactiveVar([]),
    selectCityName: '',
    detailAddress: new ReactiveVar(''),
    inited: false,
    init: function(cityName, detailAddress) {
      var cityOptions = [
        {
          name: '上海',
          attr: {
            index: 0
          }
        },
        {
          name: '北京',
          attr: {
            index: 1
          }
        },
        {
          name: '广州',
          attr: {
            index: 2
          }
        }
      ];
      this.selectCityName = cityName;
      this.detailAddress.set(detailAddress);
      _.each(cityOptions, function(city) {
        city.name === cityName ? city.attr.selected = true : '';
      });
      this.cityOptions.set(cityOptions);
      this.inited = true;
    },
    getCityOptions: function() {
      return this.cityOptions.get();
    },
    setSelectCity: function(cityName) {
      this.selectCityName = cityName;
    },
    getSelectCityName: function() {
      return this.selectCityName;
    },
    setDetailAddress: function(detailAddress) {
      this.detailAddress.set(detailAddress);
    },
    getDetailAddress: function() {
      return this.detailAddress.get();
    }
  };


  /**
   * 活动公开情况
   */
  var eventPrivate = {
    private: new ReactiveVar(false),
    inited: false,
    init: function(state) {
      state = state || false;
      this.private.set(state);
      this.inited = true;
    },
    togglePrivate: function() {
      var tempStatus = this.private.get();
      this.private.set(!tempStatus);
    },
    setPrivate: function() {
      this.private.set(true);
    },
    setPublic: function() {
      this.private.set(false);
    },
    getPrivateStatus: function() {
      return this.private.get();
    }
  };


  /**
   * 活动人数限制
   */
  var eventMemberLimit = {
    count: new ReactiveVar(0),
    inited: false,
    init: function(count) {
      this.count.set(count);
      this.inited = true;
    },
    setCount: function(count) {
      this.count.set(count);
    },
    getCount: function() {
      return this.count.get();
    }
  };


  /**
   * 活动主题选择
   */
  var eventTheme = {
    themeOptions: new ReactiveVar([]),
    selectedTheme: null,
    inited: false,
    init: function(themeName) {
      var themeOptions = [
        {
          attr: {
            index: 0
          },
          name: '创业'
        },
        {
          attr: {
            index: 1
          },
          name: '文化'
        },
        {
          attr: {
            index: 2
          },
          name: '商务'
        },
        {
          attr: {
            index: 3
          },
          name: '社交'
        },
        {
          attr: {
            index: 4
          },
          name: '公益'
        },
        {
          attr: {
            index: 5
          },
          name: '亲子'
        },
        {
          attr: {
            index: 6
          },
          name: '电影'
        },
        {
          attr: {
            index: 7
          },
          name: '娱乐'
        },
        {
          attr: {
            index: 8
          },
          name: '生活'
        },
        {
          attr: {
            index: 9
          },
          name: '音乐'
        },
        {
          attr: {
            index: 10
          },
          name: '科技'
        },
        {
          attr: {
            index: 11
          },
          name: '运动'
        },
        {
          attr: {
            index: 12
          },
          name: '课程'
        },
        {
          attr: {
            index: 13
          },
          name: '校园'
        },
        {
          attr: {
            index: 14
          },
          name: '其它'
        }
      ];
      this.selectedTheme = themeName;
      _.each(themeOptions, function(theme) {
        theme.name === themeName ? theme.attr.selected = true : '';
      });
      this.themeOptions.set(themeOptions);
      this.inited = true;
    },
    getThemeOptions: function() {
      return this.themeOptions.get();
    },
    setSelectedTheme: function(themeName) {
      this.selectedTheme = themeName;
    },
    getSelectedTheme: function() {
      return this.selectedTheme;
    }
  };


  /**
   * 活动标签
   */
  var eventTags = {
    tags: new ReactiveVar([]),
    inited: false,
    init: function(tags) {
      tags = tags || [];
      this.tags.set(tags);
      this.inited = true;
    },
    addTag: function(tag) {
      var tags = this.tags.get();
      var isExit = _.find(tags, function(tempTag) {
        return tag.name === tempTag.name;
      });
      if (isExit) {
        console.log('tag 已经存在');
      } else {
        tags.push(tag);
        this.tags.set(tags);
      }
    },
    deleteTag: function(id) {
      var tags = this.tags.get();
      var index = _.indexOf(tags, _.findWhere(tags, {_id : id}));
      tags.splice(index, 1);
      this.tags.set(tags);
    },
    getTags: function() {
      return this.tags.get();
    },
    clearTags: function() {
      this.tags.set([]);
    },
    getTagByName: function(name) {
      var tags = this.tags.get();
      var index = _.indexOf(tags, _.findWhere(tags, {name : name}));
      return -1 !== index ? tags[index] : [];
    }
  };

  /**
   * 活动描述
   */
  var eventDesc = {
    content: new ReactiveVar(''),
    contentContainerDom: new ReactiveVar(null),
    inited: false,
    init: function(contentContainerId, content) {
      this.contentContainerDom.set($('#' + contentContainerId));
      this.contentContainerDom.get().wysiwyg();
      // TODO get content from qiniu
      this.content.set(content);
      this.inited = true;
    },
    getContent: function() {
      return this.contentContainerDom.get().html();
    },
    getInitContent: function() {
      return this.content.get();
    }
  };

  /**
   * 活动表单
   */
  var eventSignForm = {

  };


  /**
   * 验证信息
   */
  var validEventInfo = function() {

  };

  /**
   * 保存活动
   */
  var saveEvent = function() {

  };

  return {
    eventTitle        : eventTitle,
    eventTime         : eventTime,
    eventLocation     : eventLocation,
    eventPrivate      : eventPrivate,
    eventMemberLimit  : eventMemberLimit,
    eventTheme        : eventTheme,
    eventTags         : eventTags,
    eventDesc         : eventDesc,
    eventSignForm     : eventSignForm,
    saveEvent         : saveEvent
  }
}());