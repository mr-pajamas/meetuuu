/**
 * Created by jym on 2015/10/10.
 */

Template.manageDiscussionItem.helpers({
  maSetTop: function () {
    if (this.setTop==1) {
      return true;
    } else {
      return false;
    }
   },
});

Template.manageDiscussionItem.events({
  "click button.viewBtn ": function (e, template) {
    console.log(template.data._id);
    // e.preventDefault();
    //console.log("hello viewBtn");
    FlowRouter.go("singleDisc", {discId : template.data._id});

  },

  "click button.editorBtn ": function (e, template) {
    console.log(template.data._id+"  "+ template.data.subject+" "+template.data.content);
    e.preventDefault();
    var content = template.data.content;
    var editDisc={_id:template.data._id, subject:template.data.subject, content:content};
    console.log(editDisc);
    Session.set("editDisc",editDisc);

    $(".modalBtn").click();
    // template.$(".viewBtn").click();
  },

  "click button.deleteBtn ": function (e, template) {
    console.log(template.data._id);
    // e.preventDefault();
    e.preventDefault();
    if (confirm("Delete this Discussion?")) {
      var updateId = template.data._id;
      console.log(updateId);
      Discussion.remove(updateId);
      Comments.remove({discussionId: updateId});
    }
  },

  "click button.topBtn ": function (e, template) {
    console.log(template.data._id);
    e.preventDefault();
    if (confirm("确定将该贴置顶")) {
         var updateId = template.data._id;
         Discussion.update({_id:updateId},{$set:{setTop: 1}}, function (error, result) {
           console.log(result);
         });
       }
  },

  "click button.cancelTopBtn ": function (e, template) {
      console.log(template.data._id);
      e.preventDefault();
      if (confirm("确定将该贴取消置顶")) {
           var updateId = template.data._id;
           Discussion.update({_id:updateId},{$set:{setTop: 0}}, function (error, result) {
             console.log(result);
           });
         }
    },
});
