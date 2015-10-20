/**
 * Created by jianyanmin on 15/10/6.
 */
Template.commentList.helpers({
    commentItems: function () {
        console.log(FlowRouter.getParam("discId"));
        return Comments.find({discussionId: FlowRouter.getParam("discId")});
    }
});