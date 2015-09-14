GeventSignForm = (function() {

  var customFormType = {
    'ESF_SINGLE_TEXT': {
      title: '单行文本框',
      type: 'ESF_SINGLE_TEXT'
    },
    'ESF_MULTI_TEXT': {
      title: '多行文本框',
      type: 'ESF_MULTI_TEXT'
    },
    'ESF_SELECT_RADIO': {
      title: '单选框',
      type: 'ESF_SELECT_RADIO',
      multi: true
    },
    'ESF_SELECT_CHECKBOX': {
      title: '多选框',
      type: 'ESF_SELECT_CHECKBOX',
      multi: true
    }
  };

  var signform = {};

  signform.customFormType = customFormType;


  signform.containerId = null;
  signform.setContainerId = function(id) {
    this.container = $('#' + id)[0];
  };

  signform.forms = {};

  // 创建
  signform.createForm = function(type) {
    var id = Meteor.uuid();
    var blazeView = Blaze.renderWithData(
      Template.ESF_CUSTOM,
      _.extend(this.customFormType[type], {'formId': id}),
      this.container
    );
    this.forms[id] = {
      'blazeView': blazeView,
      'type': type
    };
  };

  // 删除
  signform.removeForm = function(formId) {
    Blaze.remove(this.forms[formId].blazeView);
    delete this.forms[formId];
  };

  // 获取所有的数据
  signform.getFromContent = function() {
    var forms = this.forms,
        errFlag = false,
        formSchema = {};
    // 添加姓名和电话表单，作为默认表单
    formSchema['姓名'] = {
      label: '姓名',
      type: String,
      optional: false
    };
    formSchema['电话'] = {
      label: '电话',
      type: String,
      optional: false
    };
    for (var fid in forms) {
      if (forms.hasOwnProperty(fid)) {
        var isNeed = $('#need-' + fid).prop("checked"),
            title = $('#title-' + fid).val(),
            tips = $('#tips-' + fid).val(),
            type = forms[fid].type;
        // 如果需要，清除历史错误信息
        $('#title-' + fid).parent().removeClass('has-error');
        // 检测是否未定义名称
        if (!title) {
          $('#title-' + fid).parent().addClass('has-error');
          errFlag = true;
        }
        // 添加多选的可选参数
        var options = [];
        $('.options-' + fid).each(function(idx, dom) {
          var value = $(dom).val();
          options.push({'label': value, 'value': value});
        });
        // 闭包存放 options，否则所有选项是一样的
        (function(options) {
          switch (type) {
            case 'ESF_SINGLE_TEXT':
              formSchema[title] = {
                label: title,
                type: String,
                optional: !isNeed
              };
              break;
            case 'ESF_MULTI_TEXT':
              formSchema[title] = {
                label: title,
                optional: !isNeed,
                type: String,
                autoform: {
                  rows: 5
                }
              };
              break;
            case 'ESF_SELECT_RADIO':
              formSchema[title] = {
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
              break;
            case 'ESF_SELECT_CHECKBOX':
              formSchema[title] = {
                type: String,
                optional: !isNeed,
                autoform: {
                  type: "select-checkbox",
                  options: function () {
                    return options;
                  }
                }
              };
              break;
            default :
              console.log('表单制作匹配失败');
              break;
          }
        })(options);
      }
    }
    if (!errFlag) {
      return formSchema;
    }
    return [];
  };

  return signform;

}());


Template.ESF_CUSTOM.events({
  // 自定义表单控件-删除
  'click .delete-custom-form': function (e) {
    e.preventDefault();
    var formId = $(e.target).attr('data-id');
    GeventSignForm.removeForm(formId);
  },
  // 多选表单-添加选项
  'click .add-form-options': function(e) {
    e.preventDefault();
    var formId = $(e.target).attr('data-id');
    Blaze.renderWithData(
      Template['custom-form-options'],
      {'formId': formId},
      $('.custom-form-options-container-' + formId)[0]
    );
  }
})


// 多选表单的删除
Template['custom-form-options'].events({
  'click .delete-form-option': function(e) {
    e.preventDefault();
    $(e.target).parent().remove();
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