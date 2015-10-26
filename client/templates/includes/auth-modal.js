/**
 * Created by Michael on 2015/10/26.
 */
Template.authModal.onCreated(function () {
  this.signinOrJoin = new ReactiveVar(true);
});

Template.authModal.helpers({
  "signinOrJoin": function () {
    return Template.instance().signinOrJoin.get();
  }
});

Template.authModal.events({
  "click .modal-footer > button:nth-child(2)": function (event, template) {
    template.signinOrJoin.set(!template.signinOrJoin.get());
  },
  "click .modal-footer > button.btn-primary": function (event, template) {
    template.$(".auth-modal").trigger("signin.muuu");
  }
});
