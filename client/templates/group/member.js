/**
 * Created by Michael on 2015/11/20.
 */
Template.groupMember.onCreated(function () {
  var template = this;

  template.autorun(function () {
    template.memberHandle = template.subscribe("singleGroupMember", FlowRouter.getParam("memberId"));
  });
});

Template.groupMember.helpers({
  member: function () {
    return Memberships.findOne(FlowRouter.getParam("memberId"));
  },

  user: function () {
    return Meteor.users.findOne(this.userId);
  },

  roleName: function () {
    return Template.parentData().roles[this.role].name;
  },

  roles: function () {
    return _.reject(_.map(Template.parentData().roles, function (value, key) {
      return _.extend({_id: key}, value);
    }), function (value) {
      return value._id === "owner";
    });
  },
  canAssignRole: function () {
    return this.role !== "owner"; // TODO: 当前membership为owner
  }
});

Template.groupMember.events({
  "click .page-header > .appointment-btn": function (event, template) {
    template.$(".appointment-modal")
      .find("select.form-control").val(this.role).change().end()
      .modal();
    /*
    template.$(".appointment-modal select.form-control").val(this.role).change();
    template.$(".appointment-modal").modal();
    */
  },
  "click .appointment-modal .modal-footer > button.btn-primary": function (event, template) {
    template.$(".appointment-modal form").submit();
  },
  "submit .appointment-modal form": function (event, template) {
    event.preventDefault();

    var $target = $(event.currentTarget);
    var role = $target.find("[name=role]").val();

    var options = {
      membershipId: this._id,
      role: role
    };

    Meteor.call("assignRole", options, function (error) {
      if (error) {
        alert(error.reason);
      } else {
        $target.parents(".modal").modal("hide");
      }
    });
  }
});
