/* created by ck 2015-09-02 */

Session.set("selectedCity", "上海");
bdmap = null;

Template.createActivity.onCreated(function(){
  console.log('onCreated');
});

Template.createActivity.onRendered(function(){
  console.log('onRendered');

  function initialize() {
    new BMap.Map('bdmap');
  }

  var bdMapKey = '9y1ti7EVotfZ1h1PvZ1Rvxjc';
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'http://api.map.baidu.com/api?type=quick&ak=' + bdMapKey +
    '&v=1.0&callback=initialize';
  document.body.appendChild(script);

  //$('input').iCheck({
  //  checkboxClass: 'icheckbox_flat',
  //  radioClass: 'iradio_flat'
  //});

  $('#activityDesc').summernote({
    height: 300
  });

  this.$('.selectCity').selectpicker({
    style: 'btn-default',
    width: '150px'
  });
  this.$('.activityTheme').selectpicker({
    style: 'btn-default',
    width: '320px'
  });

  // 初始化 时间
  this.$('input[name="daterange"]').daterangepicker({
    "timePicker": true,
    "autoApply": true,
    "timePickerIncrement": 10,
    "showDropdowns": true,
    "locale": {
      "format": "MM/DD/YYYY A h:mm",
      "separator": " 至 ",
      "applyLabel": "确认",
      "cancelLabel": "取消",
      "fromLabel": "开始时间",
      "toLabel": "结束时间",
      "customRangeLabel": "Custom",
      "daysOfWeek": [
        "日",
        "一",
        "二",
        "三",
        "四",
        "五",
        "六"
      ],
      "monthNames": [
        "一月",
        "二月",
        "三月",
        "四月",
        "五月",
        "六月",
        "七月",
        "八月",
        "九月",
        "十月",
        "十一月",
        "十二月"
      ],
      "firstDay": 1,
    }
  }, function(start, end, label) {
    console.log("New date range selected: ' + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD') + ' (predefined range: ' + label + ')");
  });

  // 初始化 typeahead
  Meteor.typeahead.inject();
});


// helpers
Template.createActivity.helpers({
  tags: function(query, sync, callback) {
    Meteor.call('queryByName', query, {}, function(err, res) {
      if (err) {
        console.log(err);
        return;
      }
      if (_.isArray(res) && res.length === 0) {
        res.push({'name': '创建 "' + query + ' "标签', 'refers': 0, 'type': 'new', 'value': query});
      }
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
          insertTag(selectedSuggestion);
        }
      });
    } else {
      insertTag(selectedSuggestion);
    }
  }
});


// events
Template.createActivity.events({
  'keydown input[name="eventsTag"]': function(e) {
    console.log(e.which);
  },
  'focus input[name="activityAddress"]': function(e) {
    var width = $('input[name="activityAddress"]').width();
    $('#bdmap').css({
      width: width + 20
    }).show();
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
      $('#bdmap').hide();
    }
  },
  'keyup input[name="activityAddress"]': function(e) {
    var address = $(e.target).val();
    //创建地址解析器实例
    var myGeo = new BMap.Geocoder();
    // 将地址解析结果显示在地图上,并调整地图视野
    myGeo.getPoint(address, function(point){
      if (point) {
        console.log(point);
        bdmap.centerAndZoom(point, 16);
        bdmap.clearOverlays();
        bdmap.addOverlay(new BMap.Marker(point));
      }
    }, Session.get('selectedCity'));
  },
  'change .selectCity': function(e) {
    var cityName = $('.selectCity').val();
    // 重置地图
    bdmap = null;
    Session.set('selectedCity', cityName);
  }
});


Template.eventTag.events({
  'click i.delete-event-tag': function(e) {
    e.preventDefault();
    var $spanTag = $(e.target).parent(),
        id = $spanTag.attr('id');
    GeventTag.delTag(id);
    $spanTag.remove();
  }
});