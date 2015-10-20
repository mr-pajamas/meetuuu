/**
 * Created by jianyanmin on 15/10/4.
 */

Template.comment.helpers({
    errorMessage:function(field){
        var myContext = Comments.simpleSchema().namedContext("insertComment");
        return myContext.keyErrorMessage(field);
    }
});

Template.comment.events({
    "submit form" :function (e, params) {
        e.preventDefault();
        var comment = $(e.target).find('[name=comment]').val();
        var discussionId = params.data._id;
        var post ={comment:comment};
        //console.log(Meteor.userId());
        post= _.extend(post,{
            userId:Meteor.userId(),
            userName: Meteor.user().profile.name,
            discussionId: discussionId
        });
       // console.log(post);
       Comments.insert(post,{ validationContext: "insertComment"}, function(error, result) {
            var myContext1 = Comments.simpleSchema().namedContext("insertComment");
            //console.log(myContext1.getErrorObject());
            if(result) {
              Discussion.update(discussionId,  {$inc: {commentCount: 1}, $set:{ lastReplyAt: new Date(), lastReplyUser: Meteor.user().profile.name, lastReplyUserId: Meteor.userId()}});
            }
        });
      $(e.target).find('[name=comment]').val("");
    },
});
