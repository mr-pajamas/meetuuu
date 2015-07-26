Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading'
});

Router.route('/', {name: 'home'});
Router.route('/group/create', {name: 'group.create'});
Router.route('/group/home', {name: 'group.home'});
Router.route('/group/123', function() {
  this.layout('groupLayout');
  this.render('testLayout');
});
