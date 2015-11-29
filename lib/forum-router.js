/**
 * Created by jianyanmin on 15/10/20.
 */

FlowRouter.route('/groups/:groupPath/discussion/', {
  action: function (params, queryParams) {
    BlazeLayout.render("groupLayout", {main: "forumListDiscussion"})
  },
  name: 'discussion'
});

FlowRouter.route('/groups/:groupPath/discussion/start', {
  action: function (params, queryParams) {
    BlazeLayout.render("groupLayout", { main: "forumStartDiscussion"})
  },
  name: 'start'
});

//讨论单页
FlowRouter.route('/groups/:groupPath/discussion/singlediscussion/:discId', {
  action: function(params, queryParams) {
    //console.log(params)
    BlazeLayout.render('groupLayout',{ main: 'forumSingleDiscussion'});
  },
  name: "singleDisc"
});

//编辑单页
FlowRouter.route('/groups/:groupPath/discussion/edit/:discId', {
  subscriptions: function (params, queryParams) {
    //console.log(params);
    this.register('singleDisc', Meteor.subscribe('singleDiscussion', params.discId));
  },
  action: function(params, queryParams) {
    BlazeLayout.render('groupLayout',{ main: 'forumEditDiscussion'});
  },
  name: "editDisc"
});

//讨论单页
FlowRouter.route('/groups/manageDiscussion', {
  subscriptions: function () {
      this.register('discussionList',Meteor.subscribe("listDiscussion"));
    },
  action: function(params, queryParams) {
    BlazeLayout.render('groupLayout',{ main: 'manageDiscussionList'});
  },
  name: "manageDiscussion"
});

