/* created by ck 2015-09-02 */

// 城市选择
Session.set("selectedCity", "上海");
// 百度地图
var bdmap = null;
// 预览表单
var previewForms = new ReactiveVar({});


Template.editEvent.onRendered(function() {
  // 构造event Id
  if (!FlowRouter.getParam('eid')) {
    FlowRouter.setParams({'eid': new Mongo.ObjectID()._str});
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

  // 富文本编辑器
  $('#event-desc').wysiwyg();

  // 自动补全提示
  Meteor.typeahead.inject();

  // 初始化表单控件
  GeventSignForm.setContainerId('custom-form-container');

  // 初始化时间信息
  var datepickerOptions = {
    format: "yyyy/mm/dd",
    clearBtn: true,
    language: "zh-CN",
    todayHighlight: true
  };
  $('.datetimepicker-start').datepicker(datepickerOptions);
  $('.datetimepicker-end').datepicker(datepickerOptions);
});

Template.editEvent.helpers({
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
      if (GeventTag.addTag(tag)) {
        Blaze.renderWithData(Template.eventTag, tag, $('#selected-tag')[0]);
      }
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
  form: function() {
    var schema = previewForms.get();
    if (!schema) {
      return ;
    }
    return new SimpleSchema(schema);
  }
});


// events
Template.editEvent.events({
  'keydown input[name="eventsTag"]': function(e) {
    console.log(e.which);
  },
  'focus #event-detail-address': function(e) {
    $('#bdmap').slideDown({
      start: function () {
        $(".event-map-container").show();       // modified by Chen yuan. 2015-09-18
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
          $(".event-map-container").hide();   // modified by Chen yuan. 2015-09-18
        }
      });
    }
  },
  'keyup #event-detail-address': function(e) {
    var address = $(e.target).val();
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
  'change #event-city-select': function(e) {
    var cityName = $('#event-city-select').val();
    bdmap = null;
    Session.set('selectedCity', cityName);
  },
  'change #event-private': function(e) {
    var isPublic = $(e.target).prop("checked");
    if (!isPublic) {
      $('#event-member-limit').attr('disabled', true);
    } else {
      $('#event-member-limit').attr('disabled', false);
    }
  },
  'click #submitBaiscInfo': function(e) {
    e.preventDefault();
    e.stopPropagation();
    var eventInfo = saveEventBaiscInfo();
    console.log(eventInfo);
    Meteor.call('event.save', eventInfo, function(err, res) {
      if (!err && 0 === res.code) {
        alert('保存成功');
      }
    });
  },
  // 自定义表单控件-创建
  'click .custom-form-item': function(e) {
    e.preventDefault();
    var type = $(e.currentTarget).attr('data-type');
    var id = GeventSignForm.createForm(type);

    //created by Chenyuan, to focus on newly created input box. on 2015-09-21
    $("#title-" + id).focus();
  },
  // 预览表单
  'click .previewSignForm': function(e) {
    e.preventDefault();
    var formInfo = GeventSignForm.getFromContent(),
        errFlag = formInfo.errFlag,
        form = formInfo.formSchema;
    if (errFlag) {
      alert('信息填写不完全，表单创建失败');
      return;
    }
    previewForms.set(form);
  }
});



// input: '17:30', return second
function timeTrans(tstr) {
  var tt = tstr.split(':'),
      h = Number(tt[0]),
      m = Number(tt[1]),
      totalMinute = h * 60 + m,
      totalSecond = totalMinute * 60;
  return totalSecond;
}


function saveEventBaiscInfo() {
  var title = $('#event-name').val(),
      startTime = $('.datetimepicker-start').datepicker('getDate'),
      endTime = $('.datetimepicker-end').datepicker('getDate'),
      cityName = Session.get('selectedCity'),
      address = $('#event-detail-address').val(),
      lnglat = bdmap && bdmap.getCenter(),
      // TODO 海报 url
      posterUrl = 'http://www.huodongxing.com/Content/v2.0/img/poster/school.jpg',
      eventTheme = $('.event-theme').val(),
      tags = GeventTag.getAllTags(),
      private = !$('#event-private').prop("checked"),
      desc = $('#event-desc').html(),
      signFormInfo = GeventSignForm.getFromContent(),
      signForm = signFormInfo.formSchemaForDataBase,
      errFlag = signFormInfo.errFlag,
      endDayTime = timeTrans($('#end-time').val()),
      startDayTime = timeTrans($('#start-time').val()),
      eventMemberLimit = 0;
  if (errFlag) {
    alert('信息填写不完全，表单创建失败');
    return;
  }
  if (!private) {
    eventMemberLimit = $('#event-member-limit').val() || 0;
  }
  var eventInfo = {
    _id: new Mongo.ObjectID(FlowRouter.getParam('eid')),
    title: title,
    time: {
      start: new Date((startTime.getTime() / 1000 + startDayTime) * 1000),
      end: new Date((endTime.getTime() / 1000 + endDayTime) * 1000)
    },
    location: {
      city: cityName,
      address: address,
      lat: lnglat.lat,
      lng: lnglat.lng
    },
    poster: posterUrl,
    member: eventMemberLimit,
    theme: eventTheme,
    tags: tags,
    private: private,
    desc: desc,
    signForm: signForm
  };
  return eventInfo;
}
