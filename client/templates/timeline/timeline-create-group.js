/**
 * Created by Michael on 2015/10/31.
 */
Template.timelineCreateGroup.helpers({
  membership: function () {
    return Memberships.findOne({groupId: this.groupId, userId: this.userId});
  }
});
