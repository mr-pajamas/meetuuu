/**
 * Created by Michael on 2015/10/23.
 */
var options;

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

    options = {
      name: name,
      homeCity: homeCity,
      memberAlias: memberAlias,
      description: description
    };

    if (!Meteor.user()) {
      template.$(".auth-modal").modal();
    } else {
      createGroup();
    }
  },
  "login.muuu .auth-modal": function () {
    createGroup();
  }
});

function createGroup() {
  Meteor.call("createGroup", options, function (error, result) {
    if (error) {
      alert(error);
    } else {
      FlowRouter.go("groupHome", {groupPath: result.path});
    }
  });
}
