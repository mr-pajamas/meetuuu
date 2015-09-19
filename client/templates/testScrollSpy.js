/**
 * Created by Michael on 2015/9/6.
 */
Template.testScrollSpy.onRendered(function () {
  var that = this;

  $(document.body).scrollspy({target: "#navbar-example2", offset: function () {
    return that.$("main").offset().top + 50;
  }});
});

Template.testScrollSpy.onDestroyed(function () {
  $(document.body).scrollspy("destroy");
});
