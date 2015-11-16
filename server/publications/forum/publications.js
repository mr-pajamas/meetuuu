/**
 * Created by jym on 2015/9/9.
 */
//社群论坛
Meteor.publishComposite("listDiscussion", function (limitNum, sortType, selector, groupPath) {
  check(selector, Match.Optional(Object));
  selector = selector || {};
  return {
  find: function () {
    return Groups.find({path:groupPath});
  },
  children: [
    {

      find: function (group) {
        var sort = {};
        sort.setTop = -1;
        sort[sortType] = -1;
        selector.groupId = group._id;

        return Discussion.find(selector,{sort: sort, limit: limitNum});
      }
    }
  ]
}});
Meteor.publish('manageListDiscussion', function () {
 return Discussion.find();
 });

Meteor.publish('singleDiscussion', function (discId) {
  return Discussion.find({_id: discId});
});

Meteor.publish('comment', function () {
  return Discussion.find();
});

Meteor.publish('commentItemBefore', function (discId, limitNum, setPageTime) {
  //console.log("sassa"+limitNum);
  return Comments.find({discussionId: discId, createdAt: {$lte:setPageTime}},{sort: {createdAt: -1}, limit: limitNum } );
});

Meteor.publish('commentItemAfter', function (discId,setPageTime) {
  //console.log("sassa"+limitNum);
  return Comments.find({discussionId: discId, createdAt: {$gt:setPageTime}});
});

Meteor.publish("MyCollectionData", function(discId, userId) {
  return MyCollection.find({discussionId: discId, userId: userId});
})


