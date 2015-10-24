/* created by ck 2015-09-02 */

// 城市选择
Session.set("selectedCity", "上海");
// 百度地图
var bdmap = null;



Template.editEvent.onRendered(function() {
  var self = this;
  // 构造event Id
  if (!FlowRouter.getParam('eid')) {
    FlowRouter.setParams({'eid': new Mongo.ObjectID()._str});
    EditEvent.pureInit();
  } else {
    self.autorun(function() {
      var eid = new Mongo.ObjectID(FlowRouter.getParam('eid'));
      self.subscribe('eventDetailById', eid, function() {
        var eventInfo = Events.findOne({_id: eid});
        // 各类初始化动作
        if (!eventInfo) {
          EditEvent.pureInit();
          return;
        }
        EditEvent.InitWithData(eventInfo);
      });
    });
  }

  // 初始化地图
  function initialize() {
    new BMap.Map('bdmap');
  }

  var bdMapKey = '9y1ti7EVotfZ1h1PvZ1Rvxjc';
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'http://api.map.baidu.com/api?type=quick&ak=' + bdMapKey +
    '&v=1.0&callback=initialize';
  document.body.appendChild(script);

  // 自动补全提示
  Meteor.typeahead.inject();



  // Set options for cropper plugin
  var $image = $(".image-crop > img");
  $($image).cropper({
    //aspectRatio: 16 / 9,
    preview: ".img-preview",
    strict: true,
    autoCrop: true,
    done: function(data) {
      // 输出裁剪的参数信息
    }
  });

  var $inputImage = $("#inputImage");
  if (window.FileReader) {
    $inputImage.change(function() {
      var fileReader = new FileReader(),
          files = this.files,
          file;

      if (!files.length) {
        return;
      }

      file = files[0];

      if (/^image\/\w+$/.test(file.type)) {
        fileReader.readAsDataURL(file);
        fileReader.onload = function () {
          $inputImage.val("");
          $image.cropper("reset", true)
            .cropper("replace", this.result);
        };
      } else {
        alert("请选择图片");
      }
    });
  } else {
    $inputImage.addClass("hide");
  }

  $('#setDrag').on('click', function () {
    console.log($image.cropper("getDataURL"));
    var $btn = $(this).button('loading');
    // business logic...
    Meteor.call('sendPosterInBase64', EditEvent.eventPoster.getKey(), $image.cropper("getDataURL"), function(err, res) {
      console.log(err);
      if(!err && res.code === 0) {
        EditEvent.eventPoster.setKey(res.key);
        $btn.button('reset');
      }
    });
  });

  //$("#setDrag").click(function() {
  //  //$image.cropper("setDragMode", "crop");
  //
  //  $("#setDrag").addClass('disable');
  //
  //});
});



Template.registerHelper('generateTypeClass', function(type) {
  var typeClass = '';
  switch (type) {
    case 'ESF_SINGLE_TEXT': typeClass = 'one-line-text';break;
    case 'ESF_MULTI_TEXT': typeClass = 'multi-line-text';break;
    case 'ESF_SELECT_RADIO': typeClass = 'radio-text';break;
    case 'ESF_SELECT_CHECKBOX': typeClass = 'checkbox-text';break;
    default : Meteor.Error('表单格式匹配失败'); break;
  }
  return typeClass;
});

Template.registerHelper('isCheckBox', function(type) {
  return type === 'ESF_SELECT_CHECKBOX' ? true: false;
});

Template.registerHelper('isMultiForm', function(type) {
  if (type === 'ESF_SELECT_RADIO' || type === 'ESF_SELECT_CHECKBOX') {
    return true;
  }
  return false;
});



Template.editEvent.helpers({
  // 活动标题
  eventTitle: function() {
    return EditEvent.eventTitle.getTitle();
  },
  // 活动海报
  eventPosterUrl: function() {
    var key = EditEvent.eventPoster.getKey();
    return key ? 'http://7xjl8x.com1.z0.glb.clouddn.com/' + key : '/event-create-poster-holder.png';
  },
  // 活动开始日期
  startDate: function() {
    var startTime = EditEvent.eventTime.getStartDateInUnix();
    return moment(startTime).format('YYYY/MM/DD');
  },
  // 活动截止日期
  endDate: function() {
    var endTime = EditEvent.eventTime.getEndDateInUnix();
    return moment(endTime).format('YYYY/MM/DD');
  },
  // 活动开始时间选项
  startTimeOptions: function() {
    return EditEvent.eventTime.getStartOptions();
  },
  // 活动截止时间选项
  endTimeOptions: function() {
    return EditEvent.eventTime.getEndOptions();
  },
  // 活动城市
  cityOptions: function() {
    return EditEvent.eventLocation.getCityOptions();
  },
  // 活动具体地址
  detailAddress: function() {
    return EditEvent.eventLocation.getDetailAddress();
  },
  // 活动是否公开
  private: function() {
    return EditEvent.eventPrivate.getPrivateStatus();
  },
  // 活动人数
  memberLimit: function() {
    return EditEvent.eventMemberLimit.getCount();
  },
  // 活动主题
  themeOptions: function() {
    return EditEvent.eventTheme.getThemeOptions();
  },
  // 活动标签
  themeTags: function() {
    return EditEvent.eventTags.getTags();
  },
  // 活动详情描述
  eventDesc: function() {
    return EditEvent.eventDesc.getContent();
  },
  // 活动表单
  eventForms: function() {
    return EditEvent.eventSignForm.getForms();
  },
  tags: function(query, sync, callback) {
    Meteor.call('queryByName', query, {}, function(err, res) {
      if (err) {
        console.log(err);
        return;
      }
      if (_.isArray(res) && res.length === 0) {
        // 未找到匹配信息，提示创建新 Tag
        res.push({'name': '创建 "' + query + ' "标签', 'refers': 0, 'type': 'new', 'value': query});
      }
      // callback 为提示框提供选项
      callback(res);
    })
  },
  selected: function(event, selectedSuggestion) {
    function insertTag(tag) {
      EditEvent.eventTags.addTag(tag);
    }
    if (selectedSuggestion.type === 'new') {
      Meteor.call('insertNewTag', selectedSuggestion.value, function (err, tagId) {
        if (!err && tagId) {
          selectedSuggestion._id = tagId;
          selectedSuggestion.name = selectedSuggestion.value;
          insertTag(_.extend(selectedSuggestion, {'refers': 1}));
        }
      });
    } else {
      insertTag(selectedSuggestion);
    }
  },
  signForm: function() {
    var formSimpleSchema = EditEvent.eventSignForm.getPreviewForm();
    if (!formSimpleSchema) {
      return ;
    }
    return new SimpleSchema(formSimpleSchema);
  }
});


// events
Template.editEvent.events({
  // 保存标题
  'keyup #event-name': function(e) {
    EditEvent.eventTitle.setTitle($(e.target).val());
  },
  // 活动开始时间
  'change #start-time': function(e) {
    var time_str = $(e.target).val();
    EditEvent.eventTime.setStartTime(time_str);
  },
  // 活动开始时间
  'change #end-time': function(e) {
    var time_str = $(e.target).val();
    EditEvent.eventTime.setEndTime(time_str);
  },
  // 活动城市
  'keydown input[name="eventsTag"]': function(e) {
    console.log(e.which);
  },
  // 活动详情输入框 focus
  'focus #event-detail-address': function(e) {
    $('#bdmap').slideDown({
      start: function () {
        $(".event-map-container").show();
      }
    });
    if (!bdmap) {
      bdmap = new BMap.Map('bdmap');
      bdmap.centerAndZoom(Session.get('selectedCity'), 11);
      bdmap.addControl(new BMap.ZoomControl());
    }
  },
  'click ': function(e) {
    var $bdmap = $('#bdmap')
        offset = $bdmap.offset(),
        top = offset.top,
        left = offset.left,
        width = $bdmap.width(),
        height = $bdmap.height();
    if (e.pageX < left || e.pageX > left + width || e.pageY < top || e.pageY > top + height) {
      $('#bdmap').slideUp({
        done: function () {
          $(".event-map-container").hide();
        }
      });
    }
  },
  // 活动详细地址输入
  'keyup #event-detail-address': function(e) {
    var address = $(e.target).val();
    EditEvent.eventLocation.setDetailAddress(address);
    //创建地址解析器实例
    var myGeo = new BMap.Geocoder();
    // 将地址解析结果显示在地图上,并调整地图视野
    myGeo.getPoint(address, function(point){
      if (point) {
        // TODO 平滑过渡
        bdmap.centerAndZoom(point, 16);
        bdmap.clearOverlays();
        bdmap.addOverlay(new BMap.Marker(point));
      }
    }, Session.get('selectedCity'));
  },
  // 活动城市选择
  'change #event-city-select': function(e) {
    var cityName = $('#event-city-select').val();
    EditEvent.eventLocation.setSelectCity(cityName);
    bdmap = null;
    Session.set('selectedCity', cityName);
  },
  // 活动公开或内部
  'change #event-private': function(e) {
    var isPublic = $(e.target).prop("checked");
    if (!isPublic) {
      $('#event-member-limit').attr('disabled', true);
      EditEvent.eventPrivate.setPrivate();
    } else {
      $('#event-member-limit').attr('disabled', false);
      EditEvent.eventPrivate.setPublic();
    }
  },
  // 活动人数
  'blur #event-member-limit': function(e) {
    EditEvent.eventMemberLimit.setCount($(e.target).val());
  },
  // 活动主题选择
  'change .event-theme': function(e) {
    EditEvent.eventTheme.setSelectedTheme($(e.target).val());
  },
  // 提交表单
  'click #publishEvent': function(e) {
    e.preventDefault();
    e.stopPropagation();
    EditEvent.saveEvent();
  },
  // 自定义表单控件-创建
  'click .custom-form-item': function(e) {
    e.preventDefault();
    var type = $(e.currentTarget).attr('data-type');
    var id = EditEvent.eventSignForm.addForm(type);
    // focus wait 500ms for tempate #each operation
    Meteor.setTimeout(function() {
      $("#title-" + id).focus();
    }, 500);
  },
  // 预览活动
  'click .previewEventInfo': function(e) {
    e.preventDefault();
    $('.previewEventInfo').button('loading');
    // 提取表单,表单信息在 helper signForm
    EditEvent.eventSignForm.setPreviewForm();
    EditEvent.previewEvent();
  }
});
