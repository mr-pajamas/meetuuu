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

FlowRouter.route('/event/create', {
  name: 'create-event',
  action: function() {
    BlazeLayout.render('createEvent');
  }
});

/*----- route created by ck at 2015-09-03: End -----*/
