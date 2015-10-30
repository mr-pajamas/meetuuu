/**
 * Created by Michael on 2015/10/26.
 */
Template.registerHelper("avatarOrDefault", function (avatar) {
  return avatar || this.profile.avatar || "/images/default-avatar.png";
});

Template.registerHelper("badgeOrDefault", function (badge) {
  return badge || this.logoUrl || "/images/default-badge.png";
});

Template.registerHelper("dateFormat", function (date, pattern) {
  return moment(date).format(pattern);
});
