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
  authCreate:function() {
    var userId = Meteor.userId();
       //获得用户path
       var path = FlowRouter.getParam("groupPath");
       var group = Groups.findOne(path);
       //console.log("分组表"+groupId._id);
       var  groupId = group._id;
       var membership = Memberships.findOne({userId: userId, groupId: groupId});
       if(membership && membership.role === "owner") {
         return true;
       } else if(Roles.userIsInRole(userId, ['create-topic'], 'g'+ groupId)) {
         return true;
       }  else return false;
  },
  existGroup: function() {
    var groupId = Groups.findOne({path: FlowRouter.getParam("groupPath")});
    console.log(groupId);
    if(groupId!=null && groupId!="") {
      return true;
    } else return false;
  },
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

    var $content = template.$("#content");

    var $contentCloned = $content.clone();

    $contentCloned.find("img").each(function () {
      str.push($(this).attr("src"));
    }).attr("src", function (index) {
      return "/images/default-poster.png?i=" + index;
    });
    //console.log(str);
    //console.log($contentCloned.html());
    var groupId = Groups.findOne({path: FlowRouter.getParam("groupPath")});
    var post ={subject:subject, content: $contentCloned.html(), imgPath:str, groupId:groupId._id};
    post= _.extend(post,{
             userId:Meteor.user()._id,
             userName: Meteor.user().profile.name,
             commentCount: 0,
             upVoteCount: 0
           });
    console.log(post);
    Meteor.call("insertForum",post,function(error, result){
     if(result)
       FlowRouter.go("/groups/:groupPath/discussion/singlediscussion/:discId", {groupPath: FlowRouter.getParam("groupPath"),discId: result});
    })

/*

    var i=0;
    var imgSrc = template.$("#content").find('img').each(function () {
      //str.push($(this).attr('src'));
      $(this).attr('src',"/images/default-poster.png?i="+(i++));
      str.push($(this).attr('src',"/images/default-poster.png?i="+(i++)));
    });
*/
/*
    var contentStr = content.find('img').each(function() {
      $(this).attr('src',"/images/default-poster.png?i="+(i++));
    });
    console.log(contentStr);
    */
    /*if(str!=""&&str != null)
    {
      str = str.slice(0,4);
    }

    post= _.extend(post,{
          userId:Meteor.user()._id,
          userName: Meteor.user().profile.name,
          commentCount: 0,
          upVoteCount: 0
        });
    Discussion.insert(post,{ validationContext: "insert"}, function(error, result) {
      var myContext1 = Discussion.simpleSchema().namedContext("insert");
      if(result) {
       // console.log(FlowRouter.getParam("groupPath"));
        FlowRouter.go("/groups/:groupPath/discussion/singlediscussion/:discId", {groupPath: FlowRouter.getParam("groupPath"),discId: result});
      }
    });*/
  }
});
