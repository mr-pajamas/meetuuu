/**
 * Created by jym on 2015/9/29.
 */
Template.forumStartDiscussion.onCreated( function () {
  this.subscribe("singleGroupByPath", FlowRouter.getParam("groupPath"));
});

Template.forumStartDiscussion.onRendered( function () {
  $('#content').wysiwyg();
});

//$('#content').wysiwyg();
Template.forumStartDiscussion.helpers({
  errorMessage:function(field){
    var myContext = Discussion.simpleSchema().namedContext("insert");
    return myContext.keyErrorMessage(field);
  }
});

Template.forumStartDiscussion.events({
  "submit form": function (e, template) {
    e.preventDefault();
    var subject = $(e.target).find('[name=subject]').val();
    var str = [];
    var content = template.$("#content").html();
    var imgSrc = template.$("#content").find('img').each(function () {
      str.push($(this).attr('src'));
    });
    if(str!=""&&str != null)
    {
      str = str.slice(0,4);
    }
    var groupId = Groups.findOne({path: FlowRouter.getParam("groupPath")});
    console.log(groupId._id);
    var post ={subject:subject, content: content, imgPath:str, groupId:groupId._id};
    post= _.extend(post,{
          userId:Meteor.user()._id,
          userName: Meteor.user().profile.name,
          commentCount: 0,
          upVoteCount: 0
        });
    Discussion.insert(post,{ validationContext: "insert"}, function(error, result) {
      var myContext1 = Discussion.simpleSchema().namedContext("insert");
      if(result) {
        FlowRouter.go("singleDisc", {discId:result});
      }
    });
  }
});
