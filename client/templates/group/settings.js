/**
 * Created by Michael on 2015/11/2.
 */
var updateAffix;

Template.groupSettings.onRendered(function () {
  var template = this;

  var $main = template.$(".group-settings-main");
  var $affix = template.$(".group-settings-affix");
  //var $pageHeader = template.$(".page-header");
  //var $footer = $main.next();

  $affix.affix({
    offset: {
      top: function () {
        return (this.top = $affix.offset().top - $main.offset().top);
      }
    }
  });

  updateAffix = function () {
    $affix.affix("checkPosition");
  };

  updateAffix();

  $(window).on({
    resize: updateAffix
  });
});

Template.groupSettings.onDestroyed(function () {
  $(window).off({
    resize: updateAffix
  });
});


Template.groupSettingRoleList.helpers({
  roleList: function () {
    var self = this;
    var roles = [];
    _.each(this.roles, function (value, key) {
      roles.push(_.extend({_id: key, permissions: []}, value));
    });

    return roles;
  },

  newRoleId: function () {
    return Random.id();
  },

  permissionCount: function () {
    if (this._id == "owner") return "所有";
    return this.permissions.length;
  },

  owner: function () {
    return this._id == "owner";
  },

  default: function (attrOrClass) {
    return Template.parentData().defaultRole == this._id && (attrOrClass || true);
  }
});


Template.groupSettingRole.onCreated(function () {

});

Template.groupSettingRole.helpers({
  role: function () {
    var key = FlowRouter.getParam("roleId");
    var result = this.roles[key];

    return _.extend({_id: key, permission: []}, result);
  },
  isOwnerRole: function () {
    return this._id == "owner" && "disabled";
  },
  hasPermission: function (value) {
    return (this._id == "owner" || _.contains(this.permissions, value)) && "checked";
  },
  isDefaultRole: function () {
    return this._id == Template.parentData().defaultRole;
  }
});

Template.groupSettingRole.events({

  "change [name=permissions]": function (event, template) {
    var $target = $(event.currentTarget);
    if ($target.prop("checked")) {
      GroupPermission.add($target.val(), function (dependency) {
        template.$("input[value=" + dependency + "]").prop("checked", true);
      });
    } else {
      GroupPermission.remove($target.val(), function (dependent) {
        template.$("input[value=" + dependent + "]").prop("checked", false);
      });
    }
  },

  "submit": function (event, template) {

  }
});
