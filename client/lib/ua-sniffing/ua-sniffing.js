/**
 * Created by Michael on 2015/12/15.
 */
Meteor.isMobile = !!navigator.userAgent.match(/AppleWebKit.*Mobile.*/);

Template.registerHelper("mobile", function (value) {
  return Meteor.isMobile && (value || true);
});
