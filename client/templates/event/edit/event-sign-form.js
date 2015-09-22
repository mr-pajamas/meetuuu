GeventSignForm = (function() {

  var customFormType = {
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
  };

  var signform = {};


  signform.customFormType = customFormType;
  signform.errFlag = false;

  // 限定dom 容器范围，用于 blaze render
  signform.containerId = null;
  signform.setContainerId = function(id) {
    this.container = $('#' + id)[0];
  };


  signform.forms = [];

  // 创建
  signform.createForm = function(type) {
    var id = Meteor.uuid();

    var blazeView = Blaze.renderWithData(
      Template.ESF_CUSTOM,
      _.extend(this.customFormType[type], {'formId': id}),
      this.container
    );

    this.forms.push({
      blazeView: blazeView,
      type: type,
      id: id
    });
    /* return id to be used in template events.
    created by Chen Yuan, on 2015-09-21.
    */
    return id;
  };

  // 删除一个表单项
  signform.removeForm = function(formId) {
    var idx = _.indexOf(this.forms, _.findWhere(this.forms, { id : formId}));
    // delete blaze view
    Blaze.remove(this.forms[idx].blazeView);
    // update this.forms, delete the removed element
    this.forms.splice(idx, 1);
  };

  // 获取所有的数据
  signform.getFromContent = function() {
    var self = this;
    // reset errFlag
    self.errFlag = false;
    // 由于数据库无法储存 String， Object类元数据
    var formSchema = {},              // 用于预览，SimpleSchema 结构
        formSchemaForDataBase = [];   // array 结构，储存于数据库，用于今后构建 SimpleSchema

    // 添加姓名和电话表单，作为默认表单
    var username = {
      label: '姓名',
      type: String,
      optional: false
    };
    var telephone = {
      label: '电话',
      type: String,
      optional: false
    };
    formSchema[Meteor.uuid()] = username;
    formSchema[Meteor.uuid()] = telephone;
    formSchemaForDataBase.push(_.extend({}, username, {'id': Meteor.uuid()}));
    formSchemaForDataBase.push(_.extend({}, telephone, {'id': Meteor.uuid()}));

    _.forEach(this.forms, function(form) {
      var fid = form.id,
          isNeed = $('#need-' + fid).prop("checked"),
          title = $('#title-' + fid).val(),
          tips = $('#tips-' + fid).val(),
          type = form.type;

      // 清除历史错误信息
      $('#title-' + fid).parent().removeClass('has-error');
      // 检测是否未定义名称
      if (!title) {
        $('#title-' + fid).parent().addClass('has-error');
        self.errFlag = true;
      }

      // 添加多选的可选参数
      var options = [];
      $('.options-' + fid).each(function(idx, dom) {
        var $dom = $(dom);
        var value = $dom.val();
        $dom.parent().removeClass('has-error');
        if (!value) {
          $dom.parent().addClass('has-error');
          self.errFlag = true;
          return;
        }
        // TODO label 和 value 的值
        options.push({'label': value, 'value': idx});
      });

      // 闭包存放 options，否则所有选项是一样的
      (function(options) {
        switch (type) {
          case 'ESF_SINGLE_TEXT':
            var setting = {
              label: title,
              type: String,
              optional: !isNeed
            };
            var uuid = Meteor.uuid();
            formSchema[uuid] = setting;
            formSchemaForDataBase.push(_.extend({}, setting, {'id': uuid}));
            break;
          case 'ESF_MULTI_TEXT':
            var setting = {
              label: title,
              optional: !isNeed,
              type: String,
              autoform: {
                rows: 5
              }
            };
            var uuid = Meteor.uuid();
            formSchema[uuid] = setting;
            formSchemaForDataBase.push(_.extend({}, setting, {'id': uuid}));
            break;
          case 'ESF_SELECT_RADIO':
            var setting = {
              label: title,
              optional: !isNeed,
              type: String,
              autoform: {
                type: "select-radio",
                options: function () {
                  return options;
                }
              }
            };
            var uuid = Meteor.uuid();
            formSchema[uuid] = setting;
            formSchemaForDataBase.push(_.extend({}, setting, {'opts': options}, {id: uuid}));
            break;
          case 'ESF_SELECT_CHECKBOX':
            var setting = {
              type: String,
              label: title,
              optional: !isNeed,
              autoform: {
                type: "select-checkbox",
                options: function () {
                  return options;
                }
              }
            };
            var uuid = Meteor.uuid();
            formSchema[uuid] = setting;
            formSchemaForDataBase.push(_.extend({}, setting, {'opts': options, 'isArr': true}, {id: uuid}));
            break;
          default :
            console.log('表单制作匹配失败');
            break;
        }
      })(options);
    });

    if (!self.errFlag) {
      console.log(formSchema);
      console.log(formSchemaForDataBase);
      return {
        'formSchema': formSchema,
        'formSchemaForDataBase': formSchemaForDataBase
      };
    }
    return {
      'formSchema': [],
      'formSchemaForDataBase': [],
      'errFlag': self.errFlag
    };
  };

  return signform;

}());


Template.ESF_CUSTOM.events({
  // 自定义表单控件-删除
  'click .delete-custom-form': function (e) {
    e.preventDefault();
    var formId = $(e.currentTarget).attr('data-id');

    GeventSignForm.removeForm(formId);
  },
  // 多选表单-添加选项
  'click .add-form-options': function(e) {
    e.preventDefault();
    var formId = $(e.currentTarget).attr('data-id');
    var type = $(e.currentTarget).attr('data-type');

    var container =  $('.custom-form-options-container-' + formId)[0];
    var totalDeletes = $(container).find(".delete-form-option");

    //created by Chen yuan, at 2015, 09, 17
    var radioText = false;
    var checkboxText = false;
    var option = null;

    if (type === 'ESF_SELECT_RADIO') {
      radioText = true;
      option = "单选选项";
    } else if (type === 'ESF_SELECT_CHECKBOX') {
      checkboxText = true;
      option = "多选选项";
    }

    Blaze.renderWithData(
      Template['custom-form-options'],
      {'formId': formId, 'radioText': radioText, 'checkboxText': checkboxText, 'option': option},
      container
    );

    //created by Chen yuan. 2015, 09, 27.
    var totalDeletes = $(container).find(".delete-form-option");

    if ($(totalDeletes).size() > 2) {
       $(totalDeletes).removeAttr("disabled");
     }
  }
});


// 多选表单的删除
//created  by Chen Yuan. 2015, 09, 17.
Template['ESF_CUSTOM'].events({
  'click .delete-form-option': function(e) {
    e.preventDefault();

    var formId = $(e.currentTarget).attr("data-id");
    var container =  $('.custom-form-options-container-' + formId);

    $(e.currentTarget).parent().remove();

    var totalDeletes = $(container).find(".delete-form-option");
    // 多选项保留至少两个输入框
    if ($(totalDeletes).size() < 3) {
      $(totalDeletes).attr("disabled", "disabled");
    }
  }
});


Template.eventTag.events({
  'click i.delete-event-tag': function(e) {
    e.preventDefault();
    var $spanTag = $(e.currentTarget).parent(),
        id = $spanTag.attr('id');
    GeventTag.delTag(id);
    $spanTag.remove();
  }
});
