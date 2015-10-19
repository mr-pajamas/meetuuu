/**
 * Created by Michael on 2015/10/19.
 */
TestDocs1 = new Meteor.Collection("test-docs-1");

TestDocs1.attachSchema(new SimpleSchema({
  time: {
    type: Date
  },
  content: {
    type: String,
    optional: true
  }
}));

if (Meteor.isServer) {
  Meteor.publish("docsAfter", function (time) {
    return TestDocs1.find({time: {$gt: time}});
  });

  Meteor.publish("docsBefore", function (time, limit) {
    return TestDocs1.find({time: {$lte: time}}, {sort: {time: -1}, limit: limit});
  });
}
