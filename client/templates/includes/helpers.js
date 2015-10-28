/**
 * Created by Michael on 2015/10/26.
 */
Template.registerHelper("avatarOrDefault", function () {
  return (this.profile.avatar ? this.profile.avatar + "?_=" + this.updatedAt.getTime() : "/images/default-avatar.png");
});

Template.registerHelper("badgeOrDefault", function () {
  return (this.logoUrl ? this.logoUrl + "?_=" + this.updatedAt.getTime() : "/images/default-badge.png");
});
