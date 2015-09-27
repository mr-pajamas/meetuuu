Template.ESF_CUSTOM.events({
  // 删除表单
  'click .delete-custom-form': function (e) {
    e.preventDefault();
    var formId = $(e.currentTarget).attr('data-formId');
    EditEvent.eventSignForm.deleteFormById(formId);
  },
  // 多选表单-添加选项
  'click .add-form-options': function(e) {
    e.preventDefault();
    var formId = $(e.currentTarget).attr('data-id');
    var container =  $('.custom-form-options-container-' + formId)[0];
    EditEvent.eventSignForm.addFormOption(formId);
    //created by Chen yuan. 2015, 09, 27.
    var totalDeletes = $(container).find(".delete-form-option");
    if ($(totalDeletes).size() > 2) {
       $(totalDeletes).removeAttr("disabled");
    }
  },
  // 表单可选项的删除
  'click .delete-form-option': function(e) {
    e.preventDefault();
    var formId = $(e.currentTarget).attr("data-formId");
    var optionId = $(e.currentTarget).attr("data-optionId");
    var container =  $('.custom-form-options-container-' + formId);
    EditEvent.eventSignForm.deleteFormOption(formId, optionId);

    var totalDeletes = $(container).find(".delete-form-option");
    // 多选项保留至少两个输入框
    if ($(totalDeletes).size() < 3) {
      $(totalDeletes).attr("disabled", "disabled");
    }
  },
  // 表单 label
  'blur .sign-form-label': function(e) {
    e.preventDefault();
    var label = $(e.target).val(),
        formId = $(e.target).attr('data-formId');
    EditEvent.eventSignForm.addFormLabel(formId, label);
  },
  // 表单选项 label
  'blur .multiFormOptions': function(e) {
    e.preventDefault();
    var label = $(e.target).val(),
        formId = $(e.target).attr('data-formId'),
        optionId = $(e.target).attr('data-optionId');
    EditEvent.eventSignForm.addFormOptionLabel(formId, optionId, label);
  }
});