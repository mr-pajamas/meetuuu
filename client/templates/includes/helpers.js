/**
 * Created by Michael on 2015/10/26.
 */
Template.registerHelper("avatarOrDefault", function (avatar) {
  return avatar || "/images/default-badge.png";
});
