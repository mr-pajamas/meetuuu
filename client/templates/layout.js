/**
 * Created by Michael on 2015/12/5.
 */
Template.layout.events({
  "show.bs.modal": function () {
    Session.set("windowOccupied", true);
  },
  "hidden.bs.modal": function () {
    Session.set("windowOccupied", false);
  }
});
