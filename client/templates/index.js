/**
 * Created by Michael on 2015/9/6.
 */
var fixSearchBar;

Template.index.onRendered(function () {

  var $headerNavbar = $(".header-navbar");
  var $indexJumbotron = this.$(".index-jumbotron");
  var $searchBar = this.$(".index-search-bar");

  fixSearchBar = function () {
    var top = $indexJumbotron.outerHeight(true);

    if ($(this).scrollTop() >= top) {
      $searchBar.css({
        position: "fixed",
        top: $headerNavbar.outerHeight(),
        left: 0,
        right: 0,
        zIndex: 1000
      });

      // We assume that the parent hasn't set paddingTop
      $searchBar.parent().css("paddingTop", $searchBar.outerHeight(true));
    } else {
      $searchBar.css({
        position: "",
        top: "",
        left: "",
        right: "",
        zIndex: ""
      });
      $searchBar.parent().css("paddingTop", "");
    }
  };

  fixSearchBar();

  $(window).on({
    "scroll": fixSearchBar,
    "resize": fixSearchBar
  });
});

Template.index.onDestroyed(function () {
  $(window).off({
    "scroll": fixSearchBar,
    "resize": fixSearchBar
  });
});
