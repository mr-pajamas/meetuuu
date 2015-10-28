/**
 * Created by Michael on 2015/10/26.
 */
Template.registerHelper("avatarOrDefault", function () {
  return this.profile.avatar || "/images/default-avatar.png";
});

Template.registerHelper("badgeOrDefault", function () {
  return this.logoUrl || "/images/default-badge.png";
});
