/**
 * Created by Michael on 2015/9/17.
 */
//var value = new ReactiveVar("");

Template.styledSelect.onCreated(function () {

  var template = this;

  template.value = new ReactiveVar("");

  template.autorun(function () {
    template.value.set(Template.currentData().selectValue);
  });
});

Template.styledSelect.onRendered(function () {

  var template = this;

  template.autorun(function () {
    template.$("select.form-control").val(template.value.get());
  });
});

/*
Template.registerHelper("toArray", function () {
  return _.reject(arguments, function (arg) {
    return arg instanceof Spacebars.kw;
  });
});
*/

Template.styledSelect.helpers({
  attrs: function () {
    return _.omit(this, "inline", "extraClasses", "selectValue");
  },
  value: function () {
    return Template.instance().value.get();
  }
});

Template.styledSelect.events({
  "change select.form-control": function (event, template) {
    template.value.set($(event.currentTarget).val());
  }
});
