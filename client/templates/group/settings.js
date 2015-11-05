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

  updateAffix = _.debounce(function () {
    $affix.affix("checkPosition");
  }, 300);

  //updateAffix();

  $(window).on({
    resize: updateAffix
  });
});

Template.groupSettings.onDestroyed(function () {
  $(window).off({
    resize: updateAffix
  });
});


Template.groupSettingBasic.events({
  "submit": function (event, template) {
    event.preventDefault();

    var _id = this._id;
    var name = template.$("[name=name]").val();
    var path = template.$("[name=path]").val();
    var logoImg = template.$(".img-upload").imgUpload("crop");
    var memberAlias = template.$("[name=memberAlias]").val();
    var description = template.$("[name=description]").val();

    var groupOptions = {};
    if (_id) groupOptions._id = _id;
    if (name) groupOptions.name = name;
    if (path) groupOptions.path = path;
    if (logoImg) groupOptions.logoImg = logoImg;
    if (memberAlias) groupOptions.memberAlias = memberAlias;
    if (description) groupOptions.description = description;

    template.$("button[type=submit]").text("保存中...").prop("disabled", true);
    Meteor.call("updateGroup", groupOptions, function (error, result) {
      template.$("button[type=submit]").text("保存").prop("disabled", false);
      if (error) {
        alert(error.reason);
      } else {
        FlowRouter.go("groupHome", {groupPath: result.path});
      }
    });
  }
});


Template.groupSettingRoleList.helpers({
  roleList: function () {
    var self = this;
    var roles = [];
    _.each(this.roles, function (value, key) {
      var role = {_id: key, permissions: [], referenceCount: 0};
      if (key == "owner") role.referenceCount = 1;
      roles.push(_.extend(role, value));
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
  },

  defaultOrReferenced: function () {
    return Template.parentData().defaultRole == this._id || this.referenceCount;
  }
});

Template.groupSettingRoleList.events({
  "click .group-setting-role-remove": function (event, template) { // TODO: 需要确认
    event.preventDefault();

    var group = template.data;

    var unsetObj = {};
    var roleKey = "roles." + this._id;
    unsetObj[roleKey] = "";

    Groups.update(group._id, {$unset: unsetObj});
  },
  "click .group-setting-role-default": function (event, template) {
    event.preventDefault();

    var group = template.data;

    Groups.update(group._id, {$set: {defaultRole: this._id}});
  }
});


Template.groupSettingRole.onCreated(function () {

});

Template.groupSettingRole.helpers({
  role: function () {
    var key = FlowRouter.getParam("roleId");
    var result = this.roles[key];

    return _.extend({_id: key, permissions: []}, result);
  },
  isOwnerRole: function () {
    return this._id == "owner" && "disabled";
  },
  hasPermission: function (value) {
    return (this._id == "owner" || _.contains(this.permissions, value)) && "checked";
  }
  /*
   isDefaultRole: function () {
   return this._id == Template.parentData().defaultRole;
   }
   */
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
    event.preventDefault();

    var group = template.data;

    var _id = this._id;
    var name = template.$("[name=name]").val();
    var permissions = template.$("[name=permissions]:checked").map(function () {
      return $(this).val();
    }).get();

    if (!Match.test(name, Pattern.NonEmptyString)) {
      alert("请填写角色名称");
      return;
    }

    var duplicate = _.find(group.roles, function (value, key) {
      return (value.name === name && key !== _id);
    });

    if (duplicate) {
      alert("该角色名已被使用");
      return;
    }

    var roleOptions = {
      groupId: group._id,
      _id: _id,
      name: name,
      permissions: permissions
    };

    Meteor.call("putRole", roleOptions, function (error) {
      if (error) {
        alert(error.reason);
      } else {
        FlowRouter.go("groupSettingRoleList", {groupPath: group.path});
      }
    });
  }
});


Template.groupSettingPrivacy.helpers({
  revealMembers: function () {
    return !this.privacy.concealMembers && "checked";
  },
  revealEvents: function () {
    return !this.privacy.concealEvents && "checked";
  }
});

Template.groupSettingPrivacy.events({
  "submit": function (event, template) {
    event.preventDefault();

    var concealMembers = !template.$("[name=revealMembers]").prop("checked");
    var concealEvents = !template.$("[name=revealEvents]").prop("checked");

    var group = template.data;

    Groups.update(group._id, {$set: {privacy: {concealMembers: concealMembers, concealEvents: concealEvents}}});
  }
});
