/**
 * Created by Michael on 2015/9/6.
 */
Template.testScrollSpy.onRendered(function () {
  $(document.body).attr({
    "data-spy": "scroll",
    "data-target": "#navbar-example2"
  });
});

Template.testScrollSpy.onDestroyed(function () {
  $(document.body).removeAttr("data-spy data-target");
});
