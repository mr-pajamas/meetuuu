/**
 * Created by Michael on 2015/9/10.
 */
var stickFooter;

Template.footer.onRendered(function () {

  var $footer = this.$(".footer");

  stickFooter = function () {
    $(document.body).css("paddingBottom", $footer.outerHeight(true));
  };

  stickFooter();

  $(window).on({
    "resize": stickFooter
  });
});

Template.footer.onDestroyed(function () {
  $(window).off({
    "resize": stickFooter
  });
});
