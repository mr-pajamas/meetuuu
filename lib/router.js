/*
Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading'
});

Router.route('/', {name: 'index'});
Router.route('/group/create', {name: 'group.create'});
Router.route('/group/home', {name: 'group.home'});
Router.route('/group/123', function() {
  this.layout('groupLayout');
  this.render('testLayout');
});
*/

FlowRouter.route("/", {
  name: "index",
  action: function () {
    BlazeLayout.render("index");
  }
});

/*----- created by ck at 2015-09-03 Begin -----*/

FlowRouter.route('/event/edit/:eid?', {
  name: 'edit-event',
  action: function() {
    BlazeLayout.render('editEvent');
  }
});

FlowRouter.route('/event/detail/:eid', {
  name: 'event-detail',
  action: function() {
    BlazeLayout.render('eventDetail');
  }
});

FlowRouter.route('/event/manage/:eid', {
  name: 'event-detail',
  action: function() {
    BlazeLayout.render('eventManage');
  }
});

/*----- route created by ck at 2015-09-03: End -----*/

FlowRouter.route("/join", {
  name: "join",
  action: function () {
    BlazeLayout.render("authJoin");
  }
});

FlowRouter.route("/test-scrollspy", {
  name: "testScrollSpy",
  action: function () {
    BlazeLayout.render("layout", {main: "testScrollSpy"});
  }
});

FlowRouter.route("/test", {
  name: "test",
  action: function () {
    BlazeLayout.render("test");
  }
});
