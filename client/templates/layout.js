/**
 * Created by Michael on 2015/12/5.
 */
/*
Template.layout.helpers({
  "contentTemplate": function () {
    FlowRouter.watchPathChange();
    var currentContext = FlowRouter.current();
    if (FlowRouter.routerInGroup(currentContext, "groups")) {
      return "groupLayout";
    } else {
      return "commonLayout";
    }
  }
});
*/

Template.layout.events({
  "show.bs.modal": function () {
    Session.set("windowOccupied", true);
  },
  "hidden.bs.modal": function () {
    Session.set("windowOccupied", false);
  }
});

/*
FlowRouter.routerInGroup = function (context, groupName) {
  return !!context.route.group && groupInGroup(context.route.group, groupName);
};

function groupInGroup(group, groupName) {

  if (group.name === groupName) {
    return true;
  } else if (group.parent) {
    return groupInGroup(group.parent, groupName);
  } else {
    return false;
  }
}
*/
