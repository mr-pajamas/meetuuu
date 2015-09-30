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

FlowRouter.route("/join", {
  name: "join",
  action: function () {
    BlazeLayout.render("layoutCustomFooter", {main: "authJoin", footer: "footerBase"});
  }
});

/*----- created by ck at 2015-09-03 Begin -----*/

FlowRouter.route('/event/edit/:eid?', {
  name: 'edit-event',
  action: function() {
    //  created by Chen Yuan, on 2015-09-29.
    BlazeLayout.render("layoutCustomFooter", {main: "editEvent", footer: "footerBase"});
  }
});

FlowRouter.route('/event/detail/:eid', {
  name: 'event-detail',
  action: function() {
    BlazeLayout.render("layoutCustomFooter", {main: "eventDetail", footer: "eventDetailAffixFooter"});
  }
});

FlowRouter.route('/event/manage/:eid', {
  name: 'event-detail',
  action: function() {
    BlazeLayout.render("layout", {main: "eventManage"});
  }
});

/*----- route created by ck at 2015-09-03: End -----*/

FlowRouter.route("/join", {
  name: "join",
  action: function () {
    BlazeLayout.render("layout", {main: "authJoin"});
  }
});
