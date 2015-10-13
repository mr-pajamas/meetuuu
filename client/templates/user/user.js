/**
 * Created by cy on 08/10/15.
 */
Template.user.onCreated(function (e) {
  // TODO: subscribe data from Mongo.
});
Template.user.onRendered(function () {
  $(document.body).scrollspy({
    target: ".scrollspy-wrap",
    offset: 96
  });
});
Template.user.onDestroyed(function () {
  $(document.body).scrollspy("destroy");
});
Template.user.events({
  "click .user-tab": function (e) {
    e.preventDefault();
    var target = $(e.currentTarget).data().accordion;
    $(".collapse").not($(target)).collapse("hide");
    $(target).collapse("toggle");
    $(e.currentTarget).tab("show");
  },
  "click .scroll-trigger": function (e) {
    var that = e.currentTarget;
    if (location.pathname.replace(/^\//, '') == that.pathname.replace(/^\//, '') && location.hostname == that.hostname) {
      var target = $(that.hash);
      target = target.length ? target : $('[name=' + that.hash.slice(1) + ']');
      if (target.length) {
        $('body').animate({
          scrollTop: target.offset().top - 95
        // TODO:  这里的61需要优化，以便能够适应更多情况。
        }, 300);
      }
    }
    return false;
  }
});
