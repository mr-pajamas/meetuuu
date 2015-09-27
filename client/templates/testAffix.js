/**
 * Created by Michael on 2015/9/24.
 */
Template.testAffix.events({
  "click .test-affix-container > div:last-child": function (event, template) {
    $(event.target).toggleClass("toggled");
  }
});
