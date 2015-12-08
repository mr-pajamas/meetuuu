/**
 * Created by Michael on 2015/9/17.
 */
//var value = new ReactiveVar("");

Template.styledSelect.onCreated(function () {

  var template = this;

  //template.value = new ReactiveVar("");
  template.selectText = new ReactiveVar("");
  /*
  template.autorun(function () {
    template.value.set(Template.currentData().selectValue);
  });
  */
});

Template.styledSelect.onRendered(function () {

  var template = this;

  template.autorun(function () {

    var value = Template.currentData().selectValue;

    var selectText = template.$("select.form-control > option[value='" + value + "']").text();
    selectText = selectText || value;

    template.selectText.set(selectText);

    template.$("select.form-control").val(value);
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
  /*
  value: function () {
    return Template.instance().value.get();
  },
  */
  selectText: function () {
    return Template.instance().selectText.get();
  }
});

Template.styledSelect.events({
  "change select.form-control": function (event, template) {
    //template.value.set($(event.currentTarget).val());
    template.selectText.set($(event.currentTarget).children(":selected").text());
  }
});
