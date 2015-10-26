/**
 * Created by Michael on 2015/10/25.
 */
Template.testItem.onCreated(function () {
  this.fileVar = new ReactiveVar(1);
});

Template.testItem.helpers({
  name: function () {
    return Template.instance().fileVar.get();
  }
});

Template.testItem.events({
  "click p": function (event, template) {
    template.fileVar.set(template.fileVar.get() + 1);
  }
});
