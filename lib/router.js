FlowRouter.route("/", {
  name: "index",
  triggersEnter: [function (context, redirect) {
    redirect("eventList");
  }]
});

FlowRouter.route("/events", {
  name: "eventList",
  action: function () {
    BlazeLayout.render("layout", {main: "index", footer: "footer"});
  }
});

FlowRouter.route("/join", {
  name: "join",
  action: function () {
    BlazeLayout.render("layout", {main: "authJoin", footer: "footerBase"});
  }
});

// TODO: remove this!
FlowRouter.route("/join-insecure", {
  name: "joinInsecure",
  action: function () {
    BlazeLayout.render("layout", {main: "authJoinInsecure", footer: "footerBase"});
  }
});

FlowRouter.route("/signin", {
  name: "signin",
  action: function () {
    BlazeLayout.render("layout", {main: "authSignin", footer: "footerBase"});
  }
});

/*----- created by ck at 2015-09-03 Begin -----*/

FlowRouter.route('/event/edit/:eid?', {
  name: 'eventEdit',
  /*
  triggersEnter: [function (context, redirect) {
    if (!context.params || !context.params.eid) redirect(FlowRouter.path(context.route.pathDef, {eid: new Mongo.ObjectID()._str}, context.queryParams));
  }],
  */
  action: function() {
    //  created by Chen Yuan, on 2015-09-29.
    BlazeLayout.render("layout", {main: "editEvent", footer: "footerBase"});
  }
});

FlowRouter.route('/event/detail/:eid', {
  name: 'eventDetail',
  action: function() {
    BlazeLayout.render("layout", {main: "eventDetail", footer: "eventDetailAffixFooter"});
  }
});

FlowRouter.route('/event/manage/:eid', {
  name: 'eventManage',
  action: function() {
    BlazeLayout.render("layout", {main: "eventManage", footer: "footerBase"});
  }
});

/*----- route created by ck at 2015-09-03: End -----*/
