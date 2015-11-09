/**
 * Created by Michael on 2015/9/6.
 */
var expandJumbotron;
var fixSearchBar;

Template.index.onCreated(function () {
  var template = this;

  template.now = new ReactiveVar(new Date());

  template.autorun(function () {
    var city = Meteor.city();
    var routeName = FlowRouter.getRouteName();
    var searchString = FlowRouter.getQueryParam("q");

    var selector, options;

    if (routeName == "eventList") {

      Tracker.autorun(function () {
        var now = template.now.get();

        // TODO
      });

    } else {
      selector = {};
      if (searchString) selector.name = {$regex: searchString, $options: "i"};

      options = {
        sort: {
          foundedDate: -1,
          eventCount: -1,
          memberCount: -1
        },
        limit: 20
      };

      template.searchHandle = template.subscribe("groups", city, selector, options);
    }
  });

  template.autorun(function () {
    template.now.get();
    var now = moment();

    var upcoming = Events.findOne({});

    // TODO

  });
});

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

Template.index.helpers({

  groupList: function () {
    var searchString = FlowRouter.getQueryParam("q");
    var selector = {homeCity: Meteor.city()};
    if (searchString) selector.name = {$regex: searchString, $options: "i"};

    var options = {
      sort: {
        foundedDate: -1,
        eventCount: -1,
        memberCount: -1
      },
      limit: 20
    };

    return Groups.find(selector, options);
  },

  eventList: function () {
    var searchString = FlowRouter.getQueryParam("q");
    var selector = {"location.city": Meteor.city()};
    if (searchString) selector.title = {$regex: searchString, $options: "i"};

    var options = {
      sort: {

      },
      limit: 20
    };

    // TODO
  },

  searchOption: function () {
    return FlowRouter.getRouteName() === "eventList" ? "找活动" : "找组织";
  }
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
  },
  "change .index-search-bar select, change .index-search-bar [name=searchOption]:checked": function (event) {
    var query = {};
    if (FlowRouter.getQueryParam("q")) query.q = FlowRouter.getQueryParam("q");

    var currentValue = $(event.currentTarget).val();
    if ("找活动" === currentValue) {
      FlowRouter.go("eventList", {}, query);
    } else {
      FlowRouter.go("groupList", {}, query);
    }
  },

  "input .index-search-bar input[name=searchString]": _.debounce(triggerSearch, 300),

  "submit .index-search-bar form": function (event, template) {
    event.preventDefault();
    triggerSearch(event, template);
  }
});

function triggerSearch(event, template) {
  var val = template.$(".index-search-bar form:visible input[name=searchString]").val();
  template.$(".index-search-bar input[name=searchString]").val(val);
  var q = $.trim(val) || null;
  FlowRouter.setQueryParams({q: q});
}
