/**
 * Created by Michael on 2015/9/14.
 */
var stickFooter;

Template.footerCompact.onRendered(function () {
  var $footer = this.$(".footer-compact");

  stickFooter = function () {
    $(document.body).css("paddingBottom", $footer.outerHeight(true));
  };

  stickFooter();

  $(window).on({
    "resize": stickFooter
  });
});

Template.footerCompact.onDestroyed(function () {
  $(window).off({
    "resize": stickFooter
  });
});
