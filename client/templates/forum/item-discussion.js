/**
 * Created by jym on 2015/10/8.
 */
Template.forumItemDiscussion.onRendered( function () {

})
Template.forumItemDiscussion.helpers({
  alreadyVote: function () {
    var updateId = this._id;
    var disc = Discussion.findOne({_id: updateId});
    return _.include(disc.upVote, Meteor.user()._id);
  },
  showTime: function () {
    var nowTime = moment();
    var createAt = this.createdAt;
    var diff = moment.duration(nowTime.diff(createAt)).asSeconds();
    var diffh = moment.duration(nowTime.diff(createAt)).asHours();
    if(parseInt(diff)<60){
      return "刚刚";
    }
    if (parseInt(diffh)<12)
    {
      return moment(createAt).fromNow().toString();
    }
    else{
      return moment(createAt).format("YYYY-MM-DD HH:mm:ss");
    }

  },
  setTopCss: function () {
    if (this.setTop==1) {
      console.log(this.imgPath);
      return true;
    } else {
      return false;
    }
  },
  contentFormate: function () {
    if(this.content.indexOf('<img')>=0)
     {
       return  (this.content.substring(0, this.content.indexOf('<img'))).replace(/<[^>]+>/g,"").substring(0,150) ;
     }
     else
     {
       return this.content.replace(/<[^>]+>/g,"").substring(0,150) ;
     }
  }
});

Template.forumItemDiscussion.events({
  "click a.upVote": function(e, template) {
    e.preventDefault();
    if (Meteor.user() != null) {
      if (confirm("UpVote  this Discussion?")) {
        var updateId = this._id;
        var disc = Discussion.findOne({_id: updateId});
        if (!disc) {
          throw new Meteor.Error('invalid', 'Discussion not found');
        }
        if (_.include(disc.upVote, Meteor.user()._id)) {
          throw new Meteor.Error('invalid', 'User is exist');
        }
        else {
          Discussion.update(disc._id, {
            $addToSet: {upVote: Meteor.user()._id},
            $inc: {upVoteCount: 1}
          }, function (error, result) {
          });
        }
      }

    } else {
      alert("请先登录");
      FlowRouter.go("join");
    }
  },
});
