/**
 * Created by Michael on 2015/10/26.
 */
Template.groupHome.onCreated(function () {
  var template = this;

  Tracker.autorun(function () {
    var group = Template.currentData();

    template.groupOwnerHandle = template.subscribe("groupMembers", group._id, {role: "owner"});
  });
});

Template.groupHome.helpers({
  foundedDate: function () {
    return moment(this.foundedDate).format("ll");
  },
  owner: function () {
    if (Template.instance().groupOwnerHandle.ready()) {
      return Memberships.findOne({groupId: this._id, role: "owner"});
    }
  },
  ownerUser: function () {
    return Meteor.users.findOne(this.userId);
  },
  roleName: function () {
    var group = Template.parentData();
    var role = this.role || group.defaultRole;
    return group.roles[role].name;
  }
});

Template.groupHome.events({

});
