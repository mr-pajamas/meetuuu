/**
 * Created by Michael on 2015/9/14.
 */
var stickFooter;

Template.footerCustom.onRendered(function () {
  var template = this;
  var $footer = template.$(".footer-custom");
  var $footerAffix = template.$(".footer-affix");
  var $footerBase = $footerAffix.next();

  var affix = (template.data && template.data.affix);

  if (affix) {
    $footerAffix.on({
      "affixed.bs.affix": function (e) {
        $(e.target).parent().css("paddingTop", $footerAffix.outerHeight(true));
      },
      "affixed-bottom.bs.affix": function (e) {
        $(e.target).parent().css("paddingTop", 0);
      }
    });

    $footerAffix.affix({
      offset: {
        //top: 0,
        bottom: function () {
          //return (this.bottom = $footerBase.outerHeight(true));
          return $footerBase.outerHeight(true);
        }
      }
    });
  }

  stickFooter = function () {
    if (affix) $footerAffix.affix("checkPosition");
    $(document.body).css("paddingBottom", $footer.outerHeight(true));
  };

  stickFooter();

  $(window).on({
    "resize": stickFooter
  });
});

Template.footerCustom.onDestroyed(function () {
  $(window).off({
    "resize": stickFooter
  });
});
