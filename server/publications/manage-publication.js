/**
 * Created by jym on 2016/1/6.
 */
/* 所有用户*/
Meteor.publish("manageAllUsers", function () {
  return Meteor.users.find();
});
