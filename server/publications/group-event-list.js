/**
 * Created by cy on 01/11/15.
 */

Meteor.publishComposite("groupEventList", function (groupPath) {
  return {
    find: function () {
      return Groups.find({path: groupPath});
    },
    children: [
      {
        find: function (groups) {
          return Events.find({"author.club.id": groups._id});
        }
      }
    ]
  }
});
