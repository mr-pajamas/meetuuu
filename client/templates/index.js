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

  if (Meteor.user() && !Meteor.user().profile.avatar && !Session.get("hasSkippedSettingAvatar")) {
    this.$(".modal").modal();
  }
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

Template.index.events({
  "click .modal button[data-dismiss=modal]": function () {
    if (Meteor.user()) Session.setAuth("hasSkippedSettingAvatar", true);
  },
  "click .modal .modal-footer > button.btn-primary": function (event, template) {
    if (Meteor.user()) {
      Session.setAuth("hasSkippedSettingAvatar", true);
      var croppedImg = template.$(".modal .modal-body").find(".img-upload").imgUpload("crop");

      if (croppedImg) {
        $(event.currentTarget).text("上传中...").prop("disabled", true).prev().prop("disabled", true);
        Meteor.call("uploadAvatar", croppedImg, function (error) {
          $(event.currentTarget).text("确定").prop("disabled", false).prev().prop("disabled", false);
          if (error) {
            alert(error.reason);
          } else {
            alert("头像上传成功");
            template.$(".modal").modal("hide");
          }
        });
      } else {
        alert("请选择图片");
      }
    } else {
      template.$(".modal").modal("hide");
    }
  }
});
