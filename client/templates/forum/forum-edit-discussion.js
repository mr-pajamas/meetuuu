/**
 * Created by jym on 2015/9/29.
 */

Template.forumEditDiscussion.onRendered(function () {
  $('#content').wysiwyg();
});

Template.forumEditDiscussion.helpers({
  errorMessage: function (field) {
    myContext = Discussion.simpleSchema().namedContext("update");
    return myContext.keyErrorMessage(field);
  },
  discussions: function () {
    return Discussion.findOne({_id: FlowRouter.getParam("discId")});
  },
});

Template.forumEditDiscussion.events({
  "submit form": function (e, template) {
    e.preventDefault();
    var subject = $(e.target).find('[name=subject]').val();
    var content = template.$("#content").html();
    var str = [];
    var imgSrc = template.$("#content").find('img').each(function () {
      str.push($(this).attr('src'));
    });
    if (str != "" && str != null) {
      str = str.slice(0, 4);
    }
    var post = {subject: subject, content: content, imgPath: str};
    var updateId = this._id;
    Discussion.update(updateId, {$set: post}, function (error, result) {
      if (result) {
        FlowRouter.go("/groups/:groupPath/discussion/singlediscussion/:discId", {groupPath: FlowRouter.getParam("groupPath"),discId:updateId});
      }
    });
  },
});
