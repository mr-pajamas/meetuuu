GeventSignForm = (function() {
  var category = {
    '1': 'ESF_COMMON',
    '2': 'ESF_CUSTOM'
  };

  var customFormType = {
    'ESF_SINGLE_TEXT': {
      title: '单行文本框',
      type: 'ESF_SINGLE_TEXT'
    },
    'ESF_SINGLE_NUMBER': {
      title: '数字输入框',
      type: 'ESF_SINGLE_NUMBER'
    },
    'ESF_SINGLE_DATE': {
      title: '日期输入框',
      type: 'ESF_SINGLE_DATE'
    },
    'ESF_SINGLE_EMAIL': {
      title: '邮箱输入框',
      type: 'ESF_SINGLE_EMAIL'
    },
    'ESF_MULTI_TEXT': {
      title: '多行文本框',
      type: 'ESF_MULTI_TEXT'
    },
    'ESF_SINGLE_CHECKBOX': {
      title: '单选框',
      type: 'ESF_SINGLE_CHECKBOX'
    },
    'ESF_MULTI_CHECKBOX': {
      title: '多选框',
      type: 'ESF_MULTI_CHECKBOX',
      multi: true
    },
    'ESF_PULL_SELECT': {
      title: '下拉菜单',
      type: 'ESF_PULL_SELECT',
      multi: true
    }
  };

  var commonFormType = {
    '1': 'ESF_NAME',
    '2': 'ESF_TELEPHONE',
    '3': 'ESF_EMAIL',
    '4': 'ESF_SEX',
    '5': 'ESF_AGE',
    '6': 'ESF_ADDRESS'
  };

  var signform = {};

  signform.category = category;
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


        switch (type) {
          case 'ESF_SINGLE_TEXT':
            formSchema[title] = {
              label: title,
              type: String,
              optional: !isNeed
            };
            console.log(formSchema);
            break;
          case 'ESF_SINGLE_DATE':
            formSchema[title] = {
              label: title,
              type: Date,
              optional: !isNeed,
              autoform: {
                value: new Date()
              }
            };
            break;
          case 'ESF_SINGLE_NUMBER':
            formSchema[title] = {
              label: title,
              type: Number,
              optional: !isNeed
            };
            break;
          case 'ESF_SINGLE_EMAIL':
            formSchema[title] = {
              label: title,
              optional: !isNeed,
              type: String,
              regEx: SimpleSchema.RegEx.Email,
              autoform: {
                type: "email"
              }
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
          case 'ESF_SINGLE_CHECKBOX':
            formSchema[title] = {
              label: title,
              optional: !isNeed,
              type: Boolean,
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
          case 'ESF_MULTI_CHECKBOX':
            formSchema[title] = {
              label: title,
              optional: !isNeed,
              type: String,
              autoform: {
                type: "select-checkbox",
                options: function () {
                  return options;
                }
              }
            };
            break;
          case 'ESF_PULL_SELECT':
            formSchema[title] = {
              label: title,
              optional: !isNeed,
              type: String,
              autoform: {
                type: "select",
                options: function () {
                  return options;
                }
              }
            };
            break;
          default: break;
        }
      }
    }
    if (!errFlag) {
      return formSchema;
    }
    return [];
  };





  return signform;

}());