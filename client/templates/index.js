/**
 * Created by Michael on 2015/9/6.
 */
var expandJumbotron;
var fixSearchBar;

Template.index.onRendered(function () {

  //var $headerNavbar = $(".header-navbar");
  var $indexJumbotron = this.$(".index-jumbotron");
  var $searchBar = this.$(".index-search-bar");

  expandJumbotron = function () {
    $indexJumbotron.css("height", $(window).height() - $indexJumbotron.offset().top);
  };

  expandJumbotron();

  $(window).on({
    "resize": expandJumbotron
  });


  fixSearchBar = function () {
    var top = $indexJumbotron.outerHeight(true);

    if ($(this).scrollTop() >= top) {
      $searchBar.css({
        position: "fixed",
        top: $indexJumbotron.offset().top,
        left: 0,
        right: 0,
        zIndex: 1000
      });
    } else {
      $searchBar.css({
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000
      });
    }

    // 我们假设搜索栏的父级元素没有设置paddingTop
    $searchBar.parent().css("paddingTop", $searchBar.outerHeight(true));
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

  $(window).off({
    "resize": expandJumbotron
  });
});
