/**
 * Created by jianyanmin on 15/10/6.
 */
Template.forumCommentItem.onRendered(function(){

});

Template.forumCommentItem.helpers({
/*  myImg: function() {
    console.log("this user"+this.userId);
    var myImg = Meteor.users.findOne({_id: this.userId});
    console.log(myImg);

    return myImg.profile.avatar;
  },*/

  user: function () {
    return Meteor.users.findOne(this.userId);
  },

  myComment: function () {
    //console.log(this.userId);
    if(this.userId==Meteor.userId()){
      return false;
    } else {
      return true;
    }
  }
});


