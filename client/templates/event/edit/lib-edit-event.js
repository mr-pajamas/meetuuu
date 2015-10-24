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
   * 活动海报信息
   */
  var eventPoster = {
    key: new ReactiveVar(''),
    inited: false,
    init: function(key) {
      key = key || '';
      this.key.set(key);
      this.inited = true;
    },
    setKey: function(key) {
      this.key.set(key);
    },
    getKey: function() {
      return this.key.get();
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
    key: new ReactiveVar(''),
    initKey: '',
    contentContainerDom: new ReactiveVar(null),
    inited: false,
    init: function(contentContainerId, key) {
      this.contentContainerDom.set($('#' + contentContainerId));
      this.contentContainerDom.get().wysiwyg();
      this.initKey = key;
      this.key.set(key);
      this.getInitContent();
      this.inited = true;
    },
    uploadToQiniu: function(eventId) {
      console.log(this.getContent());
      var self = this;
      var eventDesc = this.contentContainerDom.get().html();
      var originKey = self.initKey;

      Meteor.call('sendRichTextInBase64', originKey, eventDesc, function(err, res) {
        if (!err && res.code === 0) {
          self.key.set(res.key);
          Meteor.call('updateEventDesc', eventId, res.key);
          console.log('活动详情上传成功');
        }
      });
    },
    // 使用该方法提取活动详情
    getInitContent: function() {
      if (!this.key.get()) {
        return ;
      }
      var self = this;
      HTTP.get('http://7xjl8x.com1.z0.glb.clouddn.com/' + this.key.get(), function(err, res) {
        if(!err && res.statusCode === 200) {
          self.content.set(res.content);
        }
      });
    },
    getContent: function() {
      return this.content.get();
    },
    getKey: function() {
      return this.key.get()
    }
  };

  /**
   * 活动表单
   */

  /* data struction
  [
    {
      id: String,
      type: String,
      label: String,
      placeholder: String,
      options: [
        {
          id: String,
          formId: String,
          label: String,
          placeholder: String
        },
      ]
    },
  ]
  */
  var eventSignForm = {
    formTypes: {
      'ESF_SINGLE_TEXT': {
        title: '单行文本框',
        type: 'ESF_SINGLE_TEXT',
        singleText: true
      },
      'ESF_MULTI_TEXT': {
        title: '多行文本框',
        type: 'ESF_MULTI_TEXT',
        multiText: true
      },
      'ESF_SELECT_RADIO': {
        title: '单选框',
        option: '单选选项',
        type: 'ESF_SELECT_RADIO',
        multi: true,
        radioText: true
      },
      'ESF_SELECT_CHECKBOX': {
        title: '多选框',
        option: '多选选项',
        type: 'ESF_SELECT_CHECKBOX',
        multi: true,
        checkboxText: true
      }
    },
    forms: new ReactiveVar([]),
    previewForm: new ReactiveVar({}),
    inited: false,
    init: function(forms) {
      forms = forms || [];
      if (forms.length === 0) {
        forms = [
          {
            type: 'ESF_SINGLE_TEXT',
            id: Meteor.uuid(),
            label: '姓名',
            placeholder: '姓名',
            disabled: true
          },
          {
            type: 'ESF_SINGLE_TEXT',
            id: Meteor.uuid(),
            label: '电话',
            placeholder: '电话',
            disabled: true
          }
        ];
      }
      this.forms.set(forms);
      this.setPreviewForm();
      this.inited = true;
    },
    setPreviewForm: function(forms) {
      var forms = forms || this.forms.get();

      var previewForm = {};
      _.each(forms, function(form) {
        var tempForm = {
          label: form.label,
          type: form.type === 'ESF_SELECT_CHECKBOX' ? [String] : String
        };
        var options = [],
            idx = -1;
        if (form.type === 'ESF_SELECT_RADIO' || form.type === 'ESF_SELECT_CHECKBOX') {
          options = form.options.map(function(option) {
            idx += 1;
            return {
              label: option.label,
              value: idx.toString()
            };
          });
        }
        switch (form.type) {
          case 'ESF_SINGLE_TEXT':
            break;
          case 'ESF_MULTI_TEXT':
            tempForm.autoform = {
              rows: 5
            };
            break;
          case 'ESF_SELECT_RADIO':
            tempForm.autoform = {
                type: "select-radio",
                options: function () {
                  return options;
                }
              }
            break;
          case 'ESF_SELECT_CHECKBOX':
            tempForm.autoform = {
              type: "select-checkbox",
              options: function () {
                return options;
              }
            }
            break;
        }
        previewForm[form.id] = tempForm;
      });

      this.previewForm.set(previewForm);
      return previewForm;
    },
    getPreviewForm: function() {
      return this.previewForm.get();
    },
    addForm: function(type) {
      var forms = this.forms.get();
      var id = Meteor.uuid();
      var form = {
        type: type,
        id: id,
        label: '',
        placeholder: this.getPlaceholder(type)
      };
      if ('ESF_SELECT_CHECKBOX' === type || 'ESF_SELECT_RADIO' === type) {
        form.options = [
          {
            formId: id,
            label: '',
            placeholder: '添加' + this.formTypes[type].option,
            id: Meteor.uuid()
          },
          {
            formId: id,
            label: '',
            placeholder: '添加' + this.formTypes[type].option,
            id: Meteor.uuid()
          }
        ];
      }
      forms.push(form);
      this.forms.set(forms);
      return id;
    },
    getPlaceholder: function(type) {
      var placeholder = '';
      switch (type) {
        case 'ESF_SINGLE_TEXT': placeholder = '单行文本';break;
        case 'ESF_MULTI_TEXT': placeholder = '多行文本';break;
        case 'ESF_SELECT_RADIO': placeholder = '单选项';break;
        case 'ESF_SELECT_CHECKBOX': placeholder = '多选项';break;
        default : Meteor.Error('表单格式匹配失败'); break;
      }
      return placeholder;
    },
    deleteFormById: function(formId) {
      var forms = this.forms.get();
      var index = _.indexOf(forms, _.findWhere(forms, {id : formId}));
      forms.splice(index, 1);
      this.forms.set(forms);
    },
    addFormLabel: function(formId, label) {
      var forms = this.forms.get();
      var index = _.indexOf(forms, _.findWhere(forms, {id : formId}));
      forms[index].label = label;
      this.forms.set(forms);
    },
    addFormOption: function(formId) {
      var forms = this.forms.get();
      var id = Meteor.uuid();
      var index = _.indexOf(forms, _.findWhere(forms, {id : formId}));
      forms[index].options.push({
        label: '',
        id: id,
        placeholder: '添加' + this.formTypes[forms[index].type].option,
        formId: forms[index].id,
      });
      this.forms.set(forms);
    },
    deleteFormOption: function(formId, optionId) {
      var forms = this.forms.get();
      var formIndex = _.indexOf(forms, _.findWhere(forms, {id : formId}));
      var options = forms[formIndex].options;
      var optionIndex = _.indexOf(options, _.findWhere(options, {id : optionId}));
      options.splice(optionIndex, 1);
      forms[formIndex].options = options;
      this.forms.set(forms);
    },
    addFormOptionLabel: function(formId, optionId, label) {
      var forms = this.forms.get();
      var formIndex = _.indexOf(forms, _.findWhere(forms, {id : formId}));
      var options = forms[formIndex].options;
      var optionIndex = _.indexOf(options, _.findWhere(options, {id : optionId}));
      options[optionIndex].label = label;
      forms[formIndex].options = options;
      this.forms.set(forms);
    },
    checkValidation: function() {
      var forms = this.forms.get();
      var errFlag = false;
      _.each(forms, function(form) {
        if (errFlag) return;
        if (!form.label) {
          errFlag = true;
          return;
        }
        _.each(form.options, function(option) {
          if (errFlag) return;
          if (!option.label) {
            errFlag = true;
          }
        });
      });
      return errFlag;

    },
    getForms: function() {
      return this.forms.get();
    }
  };


  /**
   * 验证信息
   */
  var validEventInfo = function(eventInfo) {
    var errorInfo = '';
    if(!eventInfo.title) {
      errorInfo = '请填写活动标题，不少于5个字';return errorInfo;
    }
    if (!eventInfo.time) {
      errorInfo = '请填写活动时间';return errorInfo;
    }
    if(!eventInfo.time.start) {
      errorInfo = '请填写活动开始时间';return errorInfo;
    }
    if(!eventInfo.time.end) {
      errorInfo = '请填写活动结束时间';return errorInfo;
    }
    if(!eventInfo.location.city) {
      errorInfo = '请选择活动举办城市';return errorInfo;
    }
    if(!eventInfo.location.address) {
      errorInfo = '请输入活动详细地址';return errorInfo;
    }
    if(!eventInfo.private && eventInfo.member === '') {
      errorInfo = '请填写活动人数限制';return errorInfo;
    }
    if(!eventInfo.theme) {
      errorInfo = '请选择活动主题';return errorInfo;
    }
    if(!eventInfo.poster) {
      errorInfo = '请提供活动海报';return errorInfo;
    }
    if(!eventInfo.tags || eventInfo.tags.length === 0) {
      errorInfo = '请输入活动标签';return errorInfo;
    }
    //if(!eventInfo.desc) {
    //  errorInfo = '请填写活动详情';return errorInfo;
    //}
    errorInfo = eventSignForm.checkValidation() ? '请补全报名表单' : '';
    return errorInfo;
  };

  /**
   * 保存活动，内部方法
   */
  var __saveEvent = function(successCallback) {
    var author = {
      name: Meteor.user().profile.name,
      id: Meteor.userId(),
      // TODO 改为具体俱乐部
      club: {
        name: '足球俱乐部',
        id: '123456789'
      }
    };
    var eid = FlowRouter.getParam('eid');
    //eventDesc.uploadToQiniu(eid);
    var eventInfo = {
      _id: new Mongo.ObjectID(eid),
      title: eventTitle.getTitle(),
      time: {
        start: eventTime.getStartDateInISO(),
        end: eventTime.getEndDateInISO()
      },
      location: {
        city: eventLocation.getSelectCityName(),
        address: eventLocation.getDetailAddress(),
        // TODO 活动地址 经纬度
        lat: 1.11,
        lng: 2.22
      },
      poster: eventPoster.getKey(),
      member: eventMemberLimit.getCount(),
      theme: eventTheme.getSelectedTheme(),
      tags: eventTags.getTags(),
      author: author,
      private: eventPrivate.getPrivateStatus(),
      desc: eventDesc.getKey(),
      signForm: eventSignForm.getForms()
    };

    var errMessage = validEventInfo(eventInfo);
    if (errMessage) {
      alert(errMessage);
      return;
    }
    Meteor.call('event.save', eventInfo, function(err, res) {
      if (!err && 0 === res.code) {
        console.log('活动保存成功');
        eventDesc.uploadToQiniu(eid);
        successCallback && successCallback();
      }
    });
  };

  /**
   * 保存活动，外部方法，带 alert 提示
   */
  var saveEvent = function() {
    var alertSuccess = function() {
      alert('活动保存成功');
    }
    __saveEvent(alertSuccess);
  };

  /**
   * 预览活动
   */
  var previewEvent = function() {
    var goToDetailPage = function() {
      var eid = FlowRouter.getParam('eid');
      FlowRouter.go('/event/detail/' + eid + '?preview=true');
    }
    __saveEvent(goToDetailPage);
  };

  var pureInit = function() {
    eventTitle.init('');
    eventTime.init('start-date', 'end-date', new Date(), new Date(), 30);
    eventLocation.init('上海', '');
    eventPrivate.init(false);
    eventMemberLimit.init(0);
    eventTheme.init('创业');
    eventTags.init([]);
    eventDesc.init('event-desc', '');
    eventSignForm.init([]);
    eventPoster.init();
  };

  var InitWithData = function(eventInfo) {
    EditEvent.eventTitle.init(eventInfo.title);
    EditEvent.eventTime.init('start-date', 'end-date', eventInfo.time.start, eventInfo.time.end, 30);
    EditEvent.eventLocation.init(eventInfo.location.city, eventInfo.location.address);
    EditEvent.eventPrivate.init(eventInfo.private);
    EditEvent.eventMemberLimit.init(eventInfo.private ? 0 : eventInfo.member);
    EditEvent.eventTheme.init(eventInfo.theme);
    EditEvent.eventTags.init(eventInfo.tags);
    EditEvent.eventDesc.init('event-desc', eventInfo.desc);
    EditEvent.eventSignForm.init(eventInfo.signForm);
    EditEvent.eventPoster.init(eventInfo.poster);
  };

  return {
    eventTitle        : eventTitle,
    eventTime         : eventTime,
    eventLocation     : eventLocation,
    eventPrivate      : eventPrivate,
    eventMemberLimit  : eventMemberLimit,
    eventTheme        : eventTheme,
    eventPoster       : eventPoster,
    eventTags         : eventTags,
    eventDesc         : eventDesc,
    eventSignForm     : eventSignForm,
    saveEvent         : saveEvent,
    previewEvent      : previewEvent,
    pureInit          : pureInit,
    InitWithData      : InitWithData
  }
}());