/**
 * Created by Michael on 2015/9/18.
 */
Template.test.onCreated(function () {
  this.shit = new ReactiveVar("fuck!");
  //this.shit = null;

  var template = this;
  Meteor.setTimeout(function () {
    template.shit.set("fuck2");

    Meteor.setTimeout(function () {
      //template.shit = null;

      Meteor.setTimeout(function () {
        //template.shit = new ReactiveVar("damn!");

        Meteor.setTimeout(function () {
          template.shit.set("damn2");

          Meteor.setTimeout(function () {
            template.shit = null;
          }, 2000);
        }, 2000);
      }, 2000);
    }, 2000);
  }, 2000);
});

Template.test.onRendered(function () {
});

Template.test.helpers({
  "testArray": function () {
    return Session.get("fuck");
  },
  "shitHelper": function () {
    return Session.get("fuck");
  },
  arr: function () {
    return [1, 2, 3];
  },
  shit: function () {
    if (Template.instance().shit) return Template.instance().shit.get();
    else return "shit!!!!";
  }
});
