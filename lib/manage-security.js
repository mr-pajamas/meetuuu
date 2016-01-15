/**
 * Created by jianyanmin on 16/1/9.
 */
Meteor.users.permit("update").ifLoggedIn().apply();
Groups.permit("update").ifLoggedIn().apply();
//Meteor.users.permit("update").ifHasUserId("","4g2mWiw2LhYWinP5K",this.userId).apply();
//Meteor.users.permit("update").ifHasUserId("4g2mWiw2LhYWinP5K").apply();
/*
Security.defineMethod("ifHasUserId", {
  fetch: [],
  transform: null,
  deny: function (type, arg, userId) {
    return userId !== "4g2mWiw2LhYWinP5K";
  }
});
*/
