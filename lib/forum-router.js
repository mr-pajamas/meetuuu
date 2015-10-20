/**
 * Created by jianyanmin on 15/10/20.
 */

FlowRouter.route('/discussion/', {
  action: function (params, queryParams) {
    BlazeLayout.render("groupLayout", {main: "listDiscussion"})
  },
  name: 'discussion'
});

FlowRouter.route('/start', {
  action: function (params, queryParams) {
    BlazeLayout.render("groupLayout", { main: "startDiscussion"})
  },
  name: 'start'
});

//讨论单页
FlowRouter.route('/singlediscussion/:discId', {
  subscriptions: function (params, queryParams) {
  },
  action: function(params, queryParams) {
    //console.log(params);
    BlazeLayout.render('groupLayout',{ main: 'singleDiscussion'});
  },
  name: "singleDisc"
});

//编辑单页
FlowRouter.route('/discussion/edit/:discId', {
  subscriptions: function (params, queryParams) {
    this.register('singleDisc', Meteor.subscribe('singleDiscussion', params.discId));
  },
  action: function(params, queryParams) {
    BlazeLayout.render('groupLayout',{ main: 'editDiscussion'});
  },
  name: "editDisc"
});

//讨论单页
FlowRouter.route('/manageDiscussion', {
  subscriptions: function () {
      this.register('discussionList',Meteor.subscribe("listDiscussion"));
    },
  action: function(params, queryParams) {
    BlazeLayout.render('groupLayout',{ main: 'manageDiscussionList'});
  },
  name: "manageDiscussion"
});

