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
      type: 'ESF_MULTI_TEXT',
      multi: true
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
        formArr = [],
        errFlag = false;
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
          options.push($(dom).val());
        });

        formArr.push({
          isNeed: isNeed,
          title: title,
          tips: tips,
          type: type,
          options: options.length ? options : null
        });
      }
    }
    if (!errFlag) {
      console.log(formArr);
      return formArr;
    }
    return [];
  };


  return signform;

}());