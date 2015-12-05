/**
 * Created by Michael on 2015/10/23.
 */
//var options;
function createGroup(options) {
  Meteor.call("createGroup", options, function (error, result) {
    if (error) {
      alert(error);
    } else {
      FlowRouter.go("groupHome", {groupPath: result.path});
    }
  });
}

/*
Meteor._ensure(Meteor, "postLoginActions");
Meteor.postLoginActions.createGroup = createGroup;
*/

Template.groupCreate.onRendered(function () {
  var template = this;
  template.autorun(function () {
    var postponedAction = Session.get("postponedAction");
    if (Meteor.user() && !Session.get("windowOccupied") && postponedAction && postponedAction.name === "createGroup") {
      Session.clear("postponedAction");

      createGroup(postponedAction.options);
    }
  });
});

Template.groupCreate.events({
  "submit .group-create-container > form": function (event, template) {
    event.preventDefault();

    var name = template.$("[name=name]").val();
    var homeCity = template.$("[name=homeCity]").val();
    var memberAlias = template.$("[name=memberAlias]").val();
    var description = template.$("[name=description]").val();

    if (!Match.test(name, Pattern.NonEmptyString)) {
      alert("请填写俱乐部名称");
      return;
    }

    var options = {
      name: name,
      homeCity: homeCity,
      memberAlias: memberAlias,
      description: description
    };

    if (!Meteor.user()) {
      Session.setPersistent("postponedAction", {name: "createGroup", options: options});
      Meteor.showLoginModal(true);
      //template.$(".auth-modal").modal();
    } else {
      createGroup(options);
    }
  }
  /*
   "login.muuu .auth-modal": function () {
   createGroup();
   }
   */
});
