/**
 * Created by Michael on 2015/10/26.
 */
Template.registerHelper("avatarOrDefault", function (avatar) {
  return avatar || (this.profile && this.profile.avatar) || "/images/default-avatar.png";
});

Template.registerHelper("badgeOrDefault", function (badge) {
  return badge || this.logoUrl || "/images/default-badge.png";
});

Template.registerHelper("posterOrDefault", function (poster) {
  return poster || this.poster || "/images/default-poster.png";
});

Template.registerHelper("dateFormat", function (date, pattern) {
  return moment(date).format(pattern);
});

Template.registerHelper("pronoun", function (user) {
  var gender = (user && user.profile.gender) || (this.profile && this.profile.gender);
  if (gender) return (gender === "男" ? "他" : "她");
  return "TA";
});

Template.registerHelper("fromNow", function (date) {
  return moment(date).fromNow();
});
