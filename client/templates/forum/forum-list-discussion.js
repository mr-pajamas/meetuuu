/**
 * Created by jym on 2015/9/29.
 */
var PAGE_SIZE = 10;
var limit;
var sortType;
Template.forumListDiscussion.onCreated(function () {
  limit = new ReactiveVar(PAGE_SIZE);
  sortType = new ReactiveVar("createdAt");
  var template = this;
 // template.subscribe("singleGroupByPath",FlowRouter.getParam("groupPath"));
  var path = FlowRouter.getParam("groupPath");

  //var groupId = Groups.findOne({path:path});
 /* var myGroup = MyGroups.findOne({path: path});
  console.log(myGroup.path);*/
  template.autorun(function () {

    var searchString = FlowRouter.getQueryParam("q");
    //var selector ={};
    var selector1 = {};

    if (searchString) {
      selector1.$or =[];
      //selector.subject = {$regex: searchString, $options: "i"};
      selector1.$or.push({subject: {$regex: searchString, $options: "i"}});
      //selector.content = {$regex: searchString, $options: "i"};
      selector1.$or.push({content: {$regex: searchString, $options: "i"}});
    }
        console.log(selector1);
    template.subscribe("listDiscussion", parseInt(limit.get()+1), sortType.get(), selector1, path);
  });
});

Template.forumListDiscussion.helpers({
  existSearchText: function() {

  },
  listDiscussions: function () {
    var sort={};
    sort.setTop=-1;
    sort[sortType.get()]=-1;
    return Discussion.find({}, {
      sort: sort,
      limit: (limit.get())
    });
  },
  discussionCount: function () {
    var count = Discussion.find().count();
    return count == limit.get() + 1;
  },
  flagStatus: function () {
        return (FlowRouter.getQueryParam("flag") === "1" && FlowRouter.getQueryParam("flag") != null);
      },
  authManage: function() {
    var userId = Meteor.userId();
              //获得用户path
              var path = FlowRouter.getParam("groupPath");
              var group = Groups.findOne(path);
              //console.log("分组表"+groupId._id);
              var  groupId = group._id;
              var membership = Memberships.findOne({userId: userId, groupId: groupId});
              if(membership && membership.role === "owner") {
                return {};
              } else if(Roles.userIsInRole(userId, ['pin-topic'], 'g'+ groupId) || Roles.userIsInRole(userId, ['remove-own-topic'], 'g'+ groupId)) {
                return {};
              }  else return "hidden";
  },
  authCreate: function() {
    var userId = Meteor.userId();
          //获得用户path
          var path = FlowRouter.getParam("groupPath");
          var group = Groups.findOne(path);
          //console.log("分组表"+groupId._id);
          var  groupId = group._id;
          var membership = Memberships.findOne({userId: userId, groupId: groupId});
          if(membership && membership.role === "owner") {
            return {};
          } else if(Roles.userIsInRole(userId, ['create-topic'], 'g'+ groupId)) {
            return {};
          }  else return "hidden";
  }
});
Template.forumListDiscussion.events({
  "click .searchBtn":function (e, template) {
    var searchTxt = template.$(".search-text").val();
    console.log(searchTxt);
  },
  "click .load-more": function (e, template) {
    e.preventDefault();
    limit.set(limit.get()+PAGE_SIZE);
  },
  "click .manageView": function(e, template) {
    if (FlowRouter.getQueryParam("flag") == 1) {
          FlowRouter.setQueryParams({flag: 0});
          console.log(FlowRouter.getQueryParam("flag"));
        } else {
          FlowRouter.setQueryParams({flag: 1});
        }
  },
  "click .forum-new":function (e, template) {
    sortType.set("createdAt");
    console.log(sortType.get());

  },
  "click .forum-hot":function (e, template) {
    sortType.set("upVoteCount");
    console.log(sortType.get());

    },
  "click .forum-comment":function (e, template) {
    sortType.set("commentCount");
    console.log(sortType.get());
    },
  "change .disc-type": function(e, template) {
    var mySelect = template.$(".disc-type").val();
    //console.log(""+mySelect);
    sortType.set(mySelect);
  },
  "input .list-discussion-form form input[name=search-text]": _.debounce(triggerSearch, 300),

   "submit .list-discussion-form form": function (event, template) {
     event.preventDefault();
     triggerSearch(event, template);
     //console.log(FlowRouter.getQueryParam("q"));
   },


});
function triggerSearch(event, template) {
  var q = $.trim(template.$(".list-discussion-form form input[name=search-text]").val()) || null;
  FlowRouter.setQueryParams({q: q});
}




