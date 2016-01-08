/**
 * Created by jym on 2016/1/6.
 */
Template.manageHeader.helpers({
  adminName: function() {
    return Session.get('adminName');
  }
})
