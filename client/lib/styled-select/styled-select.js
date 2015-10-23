/**
 * Created by Michael on 2015/9/17.
 */
var value = new ReactiveVar("");

Template.styledSelect.onCreated(function () {

  this.autorun(function () {
    value.set(Template.currentData().selectValue);
  });
});

Template.styledSelect.onRendered(function () {

  var template = this;

  template.autorun(function () {
    template.$("select.form-control").val(value.get());
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
  idAttrs: function () {
    if (this.id) return {id: this.id};
    else return null;
  },
  value: function () {
    return value.get();
  }
});

Template.styledSelect.events({
  "change select.form-control": function (event) {
    value.set($(event.currentTarget).val());
  }
});
