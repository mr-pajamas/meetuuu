/* created by ck 2015-09-02 */

// 城市选择
Session.setDefault("selectedCity", 0);
Session.setDefault("eventGroupId", 0);

Session.setDefault("validateEventInfo", true);   // 暂时的前端用来验证事件的session变量。 这个会做修改的。

var isInitFinished = new ReactiveVar(false);
// 百度地图
var bdmap = null;
Template.editEvent.onDestroyed(function() {
  // nothing.
});

Template.editEvent.onCreated(function () {
  var self = this;
  if (!FlowRouter.getParam('eid')) {
    //FlowRouter.setParams({'eid': new Mongo.ObjectID()._str});
    EditEvent.pureInit();
    isInitFinished.set(true);
  } else {
    self.autorun(function() {
      var eid = new Mongo.ObjectID(FlowRouter.getParam('eid'));
      self.subscribe('eventDetailById', eid, function() {
        Tracker.afterFlush(function () {
          var eventInfo = Events.findOne({_id: eid});
          // 各类初始化动作
          if (!eventInfo) {
            return ;
          } else {
            console.log("this is a existed event");
            EditEvent.InitWithData(eventInfo);
          }
          isInitFinished.set(true);
        });
      });
    });
  }
});

Template.editEvent.onRendered(function() {

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

  var eid = FlowRouter.getParam("eid");

  // 自动补全提示
  var timeoutId = Meteor.setTimeout(function () {
    if (eid) {
      $(".event-group-select").prop("disabled", true);
    }
    // initDataPicker.
    EditEvent.eventTime._initDatePicker("start-date", "end-date");
    Meteor.typeahead.inject();
    $("#event-desc").wysiwyg();
    Meteor.clearTimeout(timeoutId);
  }, 200);

  // === 上传海报 Begin  可以删除===
  /* var $image = $(".image-crop > img");
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
   alert('海报上传成功');
   }
   });
   });*/
  // === 上传海报 End===
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
  //验证是否登陆
  postAuthLogin: function() {
    if(Meteor.userId()) {
      return true;
    } else {
      return false;
    }
  },
  //验证是否具有权限
  postAuthRole: function() {
    //选择的聚乐部
    //console.log(EditEvent.eventGroups.selectedGroup.get());
    //var membership = Memberships.findOne({userId: Meteor.userId()});
    var myGroup =MyGroups.find().fetch();
    var groupId = FlowRouter.getQueryParam("eid");
    //获取事件ID
    var eid = new Mongo.ObjectID(FlowRouter.getParam('eid'));
    var findEID = Events.findOne({_id: eid});
    //如果获取到聚乐部ID进入编辑权限页面
    if(findEID) {
      var groupId = findEID.author.club.id;
      var privateStatus = findEID.private;
      //console.log(privateStatus);
      if(myGroup) {
        //console.log("ID is"+findEID.author.club.id);
        //如果有聚乐部
        var getMyGroupId = MyGroups.findOne({_id: groupId});
        /*console.log(Meteor.userId());
         console.log("g"+groupId);
         console.log(Roles.userIsInRole(Meteor.userId(), ['modify-event'], 'g'+ groupId));*/
        //如果我在该分组
        if(getMyGroupId) {
          var membership = Memberships.findOne({userId: Meteor.userId(), groupId: groupId});
          if(membership.role === "owner") {
            return true;
            //是不是具有发帖权限Meteor.userId(), ['create-event'], 'g'+ groupId) &&
          } else if(Roles.userIsInRole(Meteor.userId(), ['modify-event'], 'g'+ groupId)) {
            console.log("权限"+Roles.userIsInRole(Meteor.userId(), ['create-open-event'], 'g'+ groupId)+"活动状态"+privateStatus+"修改权限"+Roles.userIsInRole(Meteor.userId(), ['modify-event'], 'g'+ groupId));
            if(!Roles.userIsInRole(Meteor.userId(), ['create-open-event'], 'g'+ groupId) && !privateStatus) {
              return false;
            } else {
              return true;
            }
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else {
        alert("no group find");
        return false;
      }

      return true;
    }
    else {
      //如果获取聚乐部ID
      if(groupId) {
        //是否有聚乐部
        if(myGroup) {
          //如果有聚乐部
          var getMyGroupId = MyGroups.findOne({_id: groupId});
          //如果我在该分组
          if(getMyGroupId) {
            var membership = Memberships.findOne({userId: Meteor.userId(), groupId: groupId});
            if(membership && membership.role === "owner") {
              return true;
              //是不是具有发帖权限
            } else if(Roles.userIsInRole(Meteor.userId(), ['create-event'], 'g'+ groupId)) {
              return true;
            } else {
              return false;
            }
          } else {
            alert("you are not in this group");
            return false;
          }

        } else {
          alert("no group find");
          return false;
        }
        //未获取固定聚乐部ID
      }
      else {
        //如果我有聚乐部
        if(myGroup) {
          for(var i=0; i<myGroup.length; i++) {
            var membership = Memberships.findOne({userId: Meteor.userId(), groupId: myGroup[i]._id });
            if(membership && membership.role === "owner") {
              return true;
            } else if(Roles.userIsInRole(Meteor.userId(), ['create-event'], 'g'+ myGroup[i]._id)){
              // console.log(Roles.userIsInRole(Meteor.userId(), ['create-open-event'], 'g'+ myGroup[i]._id));
              return true;
            } else {
              return false;
            }
          }
        }
        else {
          alert("no find group");
          return false;
        }
      }
    }
    /* var role1=Roles.userIsInRole(Meteor.userId(), ['create-open-event'],'g'+groupId);
     var role2=Roles.userIsInRole(Meteor.userId(), ['create-event'],'g'+groupId);
     console.log(role1+"he"+role2);

     //console.log(membership.role);
     if(membership.role === "owner" && membership.joinDate) {
     return true;
     } else if(Roles.userIsInRole(Meteor.userId(), ['create-open-event'], 'g'+ groupId)) {
     return true;
     } else if(Roles.userIsInRole(Meteor.userId(), ['create-event'], 'g'+ groupId)) {
     return true;
     } else {
     return false;
     }*/
  },
  //验证是否可以发布公开消息
  openEvent: function() {
    var selectGroup = EditEvent.eventGroups.selectedGroup.get();
    console.log(selectGroup);
    if (!selectGroup) {
      return "disabled";
    }
    //console.log(EditEvent.eventGroups.selectedGroup.get());
    //已经通过权限认证
    var membership = Memberships.findOne({userId: Meteor.userId(), groupId: selectGroup.id});
    //如果是群主
    if(membership && membership.role === "owner") {
      return {};
      ////如果不具备发布公开活动的权限
    } else if(Roles.userIsInRole(Meteor.userId(), ['create-open-event'], 'g'+ selectGroup.id)) {
      return {};
    } else {
      return "disabled";
    }

  },
  // 活动标题
  eventTitle: function() {
    return EditEvent.eventTitle.getTitle();
  },
  hasPoster: function () {
    return isInitFinished.get() ? true : false;
  },
  poster: function () {
    var posterData = Session.get("eventPosterData");

    if (posterData) {
      if (posterData.startsWith("data:")) {
        return posterData;
      }
    } else {
      var posterUrl = EditEvent.eventPoster.getKey();
      return posterUrl ? posterUrl : "/event-create-poster-holder.png";
    }
  },
  // 加入的俱乐部，且具有创建活动的权利
  groupsWithRight: function() {
    //var groups = [];
    //if (!Meteor.userId()) {
    //  return groups;
    //}
    //MyGroups.find().map(function(group) {
    //  if (Roles.userIsInRole(Meteor.userId(), ['create-event', 'create-open-event'], group.path)) {
    //    groups.push({
    //      gid: group._id,
    //      name: group.name,
    //      path: group.path
    //    })
    //  }
    //});
    if (isInitFinished.get()) {
      return EditEvent.eventGroups.getGroups();
    }
  },
  //分组不可修改
  modifyGroup: function() {
    var eid = new Mongo.ObjectID(FlowRouter.getParam('eid'));
    var findEID = Events.findOne({_id: eid});
    if(findEID) {
      return "disabled";
    } else {
      return {};
    }
  },
  //公有活动的不能变私有的
  modifyPrivate: function() {
    var eid = new Mongo.ObjectID(FlowRouter.getParam('eid'));
    var findEID = Events.findOne({_id: eid});
    if(findEID) {
      if(!findEID.private) {
        return "disabled";
      } else {
        return {};
      }
    } else {
      return {};
    }
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
  hasSelectedGroup: function () {
    var gid = FlowRouter.getQueryParam("gid");
    if (gid) {
      return MyGroups.findOne({_id: gid}).name;
    } else {
      return false;
    }
  },
  // 活动城市
  cityOptions: function() {
    if (!Session.get("eventGroupId")) {
      var defaultCity;
      var gid = FlowRouter.getQueryParam("gid");
      var eid = FlowRouter.getParam("eid");
      if (!eid && gid) {
        var group = MyGroups.findOne({_id: gid});
        if (group) {
          defaultCity = group.homeCity;
        }
      } else if (eid) {
        var event = Events.findOne({_id: new Mongo.ObjectID(eid)});
        if (event) {
          var club = MyGroups.findOne({_id: event.author.club.id});
          if (club) {
            defaultCity = club.homeCity;
          }
        }
      } else {
        var firstGroup = MyGroups.findOne();
        if (firstGroup) {
          defaultCity =  firstGroup.homeCity;
        }
      }
      Session.set("selectedCity", defaultCity);
      return defaultCity;
    } else {
      return MyGroups.findOne({_id: Session.get("eventGroupId")}).homeCity;
    }
  },
  // 活动具体地址
  detailAddress: function() {
    return EditEvent.eventLocation.getDetailAddress();
  },
  // 活动是否公开
  private: function() {
    //console.log(EditEvent.eventPrivate.getPrivateStatus());
    return (EditEvent.eventPrivate.getPrivateStatus() && {}) || "checked";
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
      $('.typeahead').val('');
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

var getFormValues = function () {
  // 保存标题
  var eventName = $("#event-name").val();
  if (eventName.length < 5) {
    alert("请填写一个不少于5个字的活动标题");
    Session.set("validateEventInfo", false);
    return;
  } else {
    Session.set("validateEventInfo", true);
    EditEvent.eventTitle.setTitle(eventName);
  }

  //  俱乐部选择
  var eventGroup = $(".event-group-select").val();
  if (!eventGroup) {
    alert("请选择一个俱乐部");
    Session.set("validateEventInfo", false);
    return;
  } else {
    Session.set("validateEventInfo", true);
    var gid = FlowRouter.getQueryParam("gid");
    if (!gid) {
      EditEvent.eventGroups.changeSelectedGroup(eventGroup);
    } else {
      EditEvent.eventGroups.changeSelectedGroup(gid);
    }
  }

  // 开始时间
  var startTime = $("#start-time").val();
  var now = moment();
  var fStartTime = moment(startTime);
  if (!startTime || fStartTime < now) {
    alert("请选择一个现在之后的开始时间。");
    Session.set("validateEventInfo", false);
    return;
  } else {
    EditEvent.eventTime.setStartTime(startTime);
    Session.set("validateEventInfo", true);
  }

  //  结束时间
  var endTime = $("#end-time").val();
  var fEndTime = moment(endTime);
  if (!endTime || fEndTime <= fStartTime) {
    alert("请选择一个开始时间之后的结束时间");
    Session.set("validateEventInfo", false);
    return ;
  } else {
    EditEvent.eventTime.setEndTime(endTime);
    Session.set("validateEventInfo", true);
  }

  //活动城市
  var selectedCity = $("#event-city-select").val();
  if (!selectedCity) {
    alert("请去俱乐部编辑页面填写俱乐部所在城市");
    Session.set("validateEventInfo", false);
    return;
  } else {
    EditEvent.eventLocation.setSelectCity(selectedCity);
    Session.set("validateEventInfo", true);
  }

  //活动详细地址输入
  var detailAddress = $("#event-detail-address").val();
  if (!detailAddress) {
    alert("请填写活动详细地址");
    Session.set("validateEventInfo", false);
    return;
  } else {
    EditEvent.eventLocation.setDetailAddress(detailAddress);
    Session.set("validateEventInfo", true);
  }

  //活动公开　或者内部
  var isPublic = $("#event-private").prop("checked");
  if (!isPublic) {
    EditEvent.eventPrivate.setPrivate();
  } else {
    EditEvent.eventPrivate.setPublic();
  }

  //活动人数
  var memberLimit = $("#event-member-limit").val();
  if (isPublic && memberLimit <= 0) {
    alert("这是一个公开活动，请填写活动的限制人数");
    Session.set("validateEventInfo", false);
    return;
  } else {
    EditEvent.eventMemberLimit.setCount(memberLimit);
    Session.set("validateEventInfo", true);
  }

  //活动主题选择
  var eventTheme = $(".event-theme").val();
  if (!eventTheme) {
    alert("请选择活动主题");
    Session.set("validateEventInfo", false);
    return;
  } else {
    EditEvent.eventTheme.setSelectedTheme(eventTheme);
    Session.set("validateEventInfo", true);
  }

  //  活动描述是必填的
  var eventDesc = $("#event-desc").html().trim();
  if (!eventDesc.length) {
    alert("请填写活动详细信息。");
    Session.set("validateEventInfo", false);
    return;
  } else {
    EditEvent.eventDesc.setContent("event-desc");
    Session.set("validateEventInfo", true);
  }

  // 当验证完了所有字段之后，就设置edit-event-mask 为block.
  $(".edit-event-mask").show();
};


// events
Template.editEvent.events({
  //  俱乐部选择
  "change .event-group-select": function (e) {
    var gid = $(e.currentTarget).val();
    EditEvent.eventGroups.changeSelectedGroup(gid);
    Session.set("eventGroupId", $(e.currentTarget).val());
    Session.set("selectedCity", MyGroups.findOne({_id: Session.get("eventGroupId")}).homeCity);
  },

  // 活动详情输入框 focus
  'focus #event-detail-address': function(e, template) {
    $('#bdmap').slideDown({
      start: function () {
        $(".event-map-container").show();
      }
    });
    if (!bdmap) {
      template.autorun(function () {
        bdmap = new BMap.Map('bdmap');
        bdmap.centerAndZoom(Session.get('selectedCity'), 11);
        bdmap.addControl(new BMap.ZoomControl());
      });
    }
  },
  'click ': function(e) {
    var $bdmap = $('#bdmap');
    offset = $bdmap.offset(),
      top = offset.top,
      left = offset.left,
      width = $bdmap.width(),
      height = $bdmap.height();
    if (e.pageX < left || e.pageX > left + width || e.pageY < top || e.pageY > top + height) {
      $bdmap.slideUp({
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
  //
  // 活动公开或内部
  'change #event-private': function(e) {
    var isPublic = $(e.target).prop("checked");
    if (!isPublic) {
      EditEvent.eventPrivate.setPrivate();
    } else {
      EditEvent.eventPrivate.setPublic();
    }
  },
  // 活动主题选择
  'change .event-theme': function(e) {
    EditEvent.eventTheme.setSelectedTheme($(e.target).val());
  },
  // 提交表单
  'click #publishEvent': function(e) {
    e.preventDefault();
    e.stopPropagation();

    //  用来获取所有的form 控件的值。
    getFormValues();

    if (Session.get("validateEventInfo")) {
      $(e.currentTarget).attr("disabled", true).text("活动发布中...");
      var croppedImg = $(".event-poster").find(".img-upload").imgUpload("crop");
      EditEvent.eventPoster.setKey(croppedImg);
      EditEvent.saveEvent();
    }
  },
  // 自定义表单控件-创建
  'click .custom-form-item': function(e) {
    e.preventDefault();
    var type = $(e.currentTarget).attr('data-type');
    var id = EditEvent.eventSignForm.addForm(type);
    // focus wait 500ms for tempate #each operation
    Meteor.setTimeout(function() {
      $("#title-" + id).focus();
    }, 100);
  },
  // 预览活动
  'click .previewEventInfo': function(e) {
    e.preventDefault();
    //  用来获取所有的form 控件的值。
    getFormValues();

    if (Session.get("validateEventInfo")) {
      $('.previewEventInfo').attr("disabled", true).text("预览中...");
      // 提取表单,表单信息在 helper signForm
      EditEvent.eventSignForm.setPreviewForm();

      var croppedImg = $(".event-poster").find(".img-upload").imgUpload("crop");
      if (croppedImg) {
        Session.set("eventPosterData", croppedImg);
      } else {
        Session.set("eventPosterData", 1);
      }
      EditEvent.previewEvent();
    }
  }
});
